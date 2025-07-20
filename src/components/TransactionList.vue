<template>
    <h3>Transaction History</h3>
    <ul id="list" class="list">
        <li v-for="transaction in sortedTransactions" :key="transaction.transaction_id"
            :class="transaction.transaction_charge < 0 ? 'minus' : 'plus'">
            <span>{{ transaction.transaction_date }}</span>
            <span>{{ transaction.transaction_account }}</span>
            <span>{{ transaction.transaction_merchant }}</span>
            <span>{{ transaction.transaction_category }}</span>
            <span>{{ formatCurrency(transaction.transaction_charge) }}</span>
            <button @click="deleteTransaction(transaction.transaction_id)" class="delete-btn">❌</button>
            <button @click="editTransaction(transaction)" class="edit-btn">✏️</button>
        </li>
    </ul>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">Loading transactions...</div>
    </div>
    
    <!-- Pagination controls -->
    <div v-if="!isLoading && (totalPages > 1 || currentPage > 1)" class="pagination-container">
        <div class="pagination-info">
            <span>Page {{ currentPage }} ({{ transactions.length }} transactions)</span>
        </div>
        
        <div class="pagination-controls">
            <button 
                @click="emit('prevPage')" 
                :disabled="currentPage <= 1"
                class="pagination-btn"
            >
                ← Previous
            </button>
            
            <div class="page-numbers">
                <button 
                    v-for="page in getVisiblePages()" 
                    :key="page"
                    @click="emit('pageChanged', page)"
                    :class="['page-btn', { active: page === currentPage }]"
                >
                    {{ page }}
                </button>
            </div>
            
            <button 
                @click="emit('nextPage')" 
                :disabled="currentPage >= totalPages"
                class="pagination-btn"
            >
                Next →
            </button>
        </div>
    </div>
    <!-- Edit Transaction popup -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <v-card title="💵 Edit Transaction">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="4" sm="6">
                            <v-date-input label="Date" v-model="trDate" prepend-inner-icon="$calendar" prepend-icon=""
                                variant="outlined"></v-date-input>
                        </v-col>

                        <v-col cols="12" md="8" sm="6">
                            <v-combobox clearable label="Account" v-model="trAccount" :items="accountIds"
                                variant="outlined" :custom-filter="accountFilter" hide-no-data
                                :menu-props="{ maxHeight: '200px' }"></v-combobox>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" md="8" sm="6">
                            <v-combobox 
                                clearable 
                                label="Merchant" 
                                v-model="trMerchant"
                                :items="merchantSuggestions"
                                variant="outlined"
                                :custom-filter="merchantFilter"
                                hide-no-data
                                :menu-props="{ maxHeight: '200px' }"
                            ></v-combobox>
                        </v-col>
                        <v-col cols="12" md="4" sm="6">
                            <v-combobox clearable label="Category" v-model="trCategory" :items="categoryNames"
                                variant="outlined" :custom-filter="categoryFilter" hide-no-data
                                :menu-props="{ maxHeight: '200px' }"></v-combobox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6" sm="1">
                            <v-radio-group v-model="trTypeRadios" inline>
                                <v-radio label="Debit" value="Debit"></v-radio>
                                <v-radio label="Credit" value="Credit"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="12" md="6" sm="10">
                            <v-text-field clearable label="Amount" v-model="trAmount" prefix="$"
                                variant="outlined"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <v-textarea clearable label="Description" v-model="trDescription" variant="outlined"
                                rows="2"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn text="❌" variant="text" @click="dialog = false"></v-btn>

                    <v-btn color="primary" text="💾" variant="text" @click="saveTransactionEdits()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useToast } from 'vue-toastification'

const trId = ref(null)
const trDate = ref(new Date())
const trDateInMS = ref(null)
const trAccount = ref(null)
const trMerchant = ref(null)
const trCategory = ref(null)
const trTypeRadios = ref(null)
const trAmount = ref(null)
const trCharge = ref(null)
const trDescription = ref(null)
const dialog = ref(false)

const toast = useToast()
const emit = defineEmits(['transactionDeleted', 'transactionUpdated', 'pageChanged', 'nextPage', 'prevPage'])

const props = defineProps({
    transactions: {
        type: Array,
        required: true
    },
    accounts: {
        type: Array,
        required: true
    },
    categories: {
        type: Array,
        required: true
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    recordsPerPage: {
        type: Number,
        default: 100
    }
})

const accountIds = computed(() => props.accounts.map((account) => account.account_id))
const categoryNames = computed(() => props.categories.map((category) => category.category_name))

// Get unique merchant names from historical transactions
const merchantSuggestions = computed(() => {
    if (!props.transactions || props.transactions.length === 0) return []
    
    const merchants = [...new Set(props.transactions
        .map(t => t.transaction_merchant)
        .filter(merchant => merchant && merchant.trim() !== '')
    )]
    
    return merchants.sort((a, b) => a.localeCompare(b))
})

// Custom filter function for merchant suggestions
const merchantFilter = (item, queryText) => {
    if (!queryText) return true
    return item.toLowerCase().includes(queryText.toLowerCase())
}

// Custom filter function for category suggestions
const categoryFilter = (item, queryText) => {
    if (!queryText) return true
    return item.toLowerCase().includes(queryText.toLowerCase())
}

// Custom filter function for account suggestions
const accountFilter = (item, queryText) => {
    if (!queryText) return true
    return item.toLowerCase().includes(queryText.toLowerCase())
}

const sortedTransactions = computed(() => {
    return [...props.transactions].sort((a, b) => {
        // Sort by date descending (newest first), then by ID descending as fallback
        const dateA = new Date(a.transaction_date)
        const dateB = new Date(b.transaction_date)
        if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime()
        }
        return b.transaction_id - a.transaction_id
    })
})

const editTransaction = (transaction) => {
    trDateInMS.value = Date.parse(new Date(transaction.transaction_date))
    trId.value = transaction.transaction_id
    trDate.value = new Date(new Date(transaction.transaction_date).setDate(new Date(transaction.transaction_date).getDate() + 1))
    trAccount.value = transaction.transaction_account
    trMerchant.value = transaction.transaction_merchant
    trCategory.value = transaction.transaction_category
    trTypeRadios.value = transaction.transaction_type
    trAmount.value = transaction.transaction_amount
    trDescription.value = transaction.transaction_description
    trCharge.value = transaction.transaction_charge

    dialog.value = true
}

const saveTransactionEdits = () => {
    // Form validation - check all required fields
    if (!trDate.value) {
        toast.error('Please select a date.')
        return
    }
    
    if (!trAccount.value) {
        toast.error('Please select an account.')
        return
    }
    
    if (!trMerchant.value || trMerchant.value.trim() === '') {
        toast.error('Please enter a merchant name.')
        return
    }
    
    if (!trCategory.value) {
        toast.error('Please select a category.')
        return
    }
    
    if (!trTypeRadios.value) {
        toast.error('Please select transaction type (Debit or Credit).')
        return
    }
    
    if (!trAmount.value || trAmount.value <= 0) {
        toast.error('Please enter a valid amount greater than 0.')
        return
    }
    
    // Validate category is from dropdown list
    if (trCategory.value && !categoryNames.value.includes(trCategory.value)) {
        toast.error('Please select a valid category from the dropdown list.')
        return
    }
    
    // Validate account is from dropdown list
    if (trAccount.value && !accountIds.value.includes(trAccount.value)) {
        toast.error('Please select a valid account from the dropdown list.')
        return
    }

    const roundedAmount = Math.round(parseFloat(trAmount.value) * 100) / 100
    let updatedCharge = roundedAmount
    
    if (trTypeRadios.value === 'Debit') {
        updatedCharge = roundedAmount * -1
    } else {
        updatedCharge = Math.abs(roundedAmount)
    }

    trDateInMS.value = Date.parse(new Date(trDate.value))
    const trDateFormatted = formatDateFromMilliseconds(trDateInMS.value)
    emit('transactionUpdated', {
        transaction_id: trId.value,
        transaction_date: trDateFormatted,
        transaction_account: trAccount.value,
        transaction_merchant: trMerchant.value,
        transaction_category: trCategory.value,
        transaction_type: trTypeRadios.value,
        transaction_amount: roundedAmount,
        transaction_charge: updatedCharge,
        transaction_description: trDescription.value
    })

    dialog.value = false
}

const deleteTransaction = (id) => {
    emit('transactionDeleted', id)
}

// Calculate visible page numbers for pagination
const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5 // Show max 5 page numbers
    
    // Always show current page and a few around it
    const start = Math.max(1, props.currentPage - 2)
    const end = Math.min(props.totalPages || props.currentPage + 2, props.currentPage + 2)
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    
    return pages
}

//Date function
const formatDateFromMilliseconds = (milliseconds) => {
    const date = new Date(milliseconds)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

//Currency formatting function
const formatCurrency = (amount) => {
    if (amount < 0) {
        return `-$${Math.abs(amount)}`
    }
    return `$${amount}`
}
</script>