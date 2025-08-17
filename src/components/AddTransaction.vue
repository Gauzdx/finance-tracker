<template>
    <!-- Add Transaction Popup -->
    <div class="pa-4 text-center">
        <div class="d-flex justify-center">
            <v-dialog v-model="dialog" max-width="600">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-btn class="text-none font-weight-regular mr-6" text="💵 Add Transaction" variant="tonal"
                        v-bind="activatorProps"></v-btn>
                </template>

                <v-card title="💵 Add Transaction">
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="4" sm="6">
                                <v-date-input label="Date" v-model="trDate" prepend-inner-icon="$calendar"
                                    prepend-icon="" variant="outlined"></v-date-input>
                            </v-col>

                            <v-col cols="12" md="8" sm="6">
                                <v-combobox clearable label="Account" v-model="trAccount" :items="accountIds"
                                    variant="outlined" :custom-filter="accountFilter" hide-no-data
                                    :menu-props="{ maxHeight: '200px' }"></v-combobox>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12" md="8" sm="6">
                                <v-combobox clearable label="Merchant" v-model="trMerchant" :items="merchantSuggestions"
                                    variant="outlined" :custom-filter="merchantFilter" hide-no-data
                                    :menu-props="{ maxHeight: '200px' }"></v-combobox>
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

                        <v-btn color="primary" text="💾" variant="text" @click="onSaveBtnClick"></v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-btn class="text-none font-weight-regular ml-6" text="📊 Export to CSV" variant="tonal"
                @click="exportToCSV"></v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uuid } from 'vue-uuid'
import { useToast } from 'vue-toastification'
import { VDateInput } from 'vuetify/labs/VDateInput'
import axios from 'axios'

const datePicker = ref({
    components: {
        VDateInput
    }
})

const trDate = ref(new Date())
const trAccount = ref(null)
const trMerchant = ref(null)
const trCategory = ref(null)
const trTypeRadios = ref(null)
const trAmount = ref(null)
const trDescription = ref(null)
const dialog = ref(false)

const toast = useToast()
const emit = defineEmits(['transactionSubmitted'])

const props = defineProps({
    accounts: {
        type: Array,
        required: true
    },
    categories: {
        type: Array,
        required: true
    },
    transactions: {
        type: Array,
        required: true
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

// Helper function to format date in local timezone (avoid UTC conversion issues)
const formatDateForDB = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const onSaveBtnClick = () => {
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

    const transactionData = []
    const roundedAmount = Math.round(parseFloat(trAmount.value) * 100) / 100

    if (trTypeRadios.value == 'Debit') {
        transactionData.push({
            //id: uuid.v1(),
            date: formatDateForDB(trDate.value),
            account: trAccount.value,
            merchant: trMerchant.value,
            category: trCategory.value,
            type: trTypeRadios.value,
            amount: roundedAmount,
            charge: roundedAmount * -1,
            description: trDescription.value
        })
    } else {
        transactionData.push({
            //id: uuid.v1(),
            date: formatDateForDB(trDate.value),
            account: trAccount.value,
            merchant: trMerchant.value,
            category: trCategory.value,
            type: trTypeRadios.value,
            amount: roundedAmount,
            charge: roundedAmount,
            description: trDescription.value
        })
    }

    //Close popup
    dialog.value = false

    console.log(transactionData)
    emit('transactionSubmitted', transactionData)
}

const exportToCSV = async () => {
    try {
        toast.info('Fetching all transactions for export...')

        // Fetch all transactions by following pagination
        const allTransactions = await fetchAllTransactionsForExport()

        if (!allTransactions || allTransactions.length === 0) {
            toast.warning('No transactions to export.')
            return
        }

        // Define CSV headers
        const headers = [
            'Date',
            'Account',
            'Merchant',
            'Category',
            'Type',
            'Amount',
            'Description'
        ]

        // Convert transactions to CSV format
        const csvContent = [
            headers.join(','), // Header row
            ...allTransactions.map(transaction => [
                transaction.transaction_date,
                `"${transaction.transaction_account || ''}"`,
                `"${transaction.transaction_merchant || ''}"`,
                `"${transaction.transaction_category || ''}"`,
                transaction.transaction_type || '',
                transaction.transaction_charge || 0,
                `"${transaction.transaction_description || ''}"`
            ].join(','))
        ].join('\n')

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `transactions.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Successfully exported ${allTransactions.length} transactions!`)
        } else {
            toast.error('Export not supported in this browser.')
        }
    } catch (error) {
        console.error('Export failed:', error)
        toast.error('Failed to export transactions.')
    }
}

// Function to fetch all transactions by following nextLink pagination
const fetchAllTransactionsForExport = async () => {
    let allTransactions = []
    let nextUrl = '/data-api/rest/personaltransactions?$orderby=transaction_id desc'
    let pageCount = 0

    while (nextUrl) {
        try {
            pageCount++
            console.log(`Fetching page ${pageCount}: ${nextUrl}`)

            const response = await axios.get(nextUrl)
            const data = response.data

            console.log(`Page ${pageCount} response:`, {
                recordCount: data.value?.length || 0,
                hasNextLink: !!data.nextLink,
                nextLink: data.nextLink
            })

            // Add current batch to all transactions
            if (data.value && data.value.length > 0) {
                allTransactions = [...allTransactions, ...data.value]
                console.log(`Total transactions so far: ${allTransactions.length}`)
            }

            // Check if there's a next page
            if (data.nextLink) {
                try {
                    // Handle both full URLs and relative paths
                    if (data.nextLink.startsWith('http')) {
                        // Full URL - extract the path and query
                        const url = new URL(data.nextLink)
                        nextUrl = url.pathname + url.search
                    } else if (data.nextLink.startsWith('/')) {
                        // Already a relative path starting with /
                        nextUrl = data.nextLink
                    } else {
                        // Relative path without leading slash
                        nextUrl = '/' + data.nextLink
                    }

                    console.log(`Next URL processed: ${nextUrl}`)

                    // Show progress to user
                    toast.info(`Fetched ${allTransactions.length} transactions, continuing...`)
                } catch (urlError) {
                    console.error('Error processing nextLink URL:', urlError)
                    console.log('Raw nextLink:', data.nextLink)
                    // Try using the nextLink as-is if URL parsing fails
                    nextUrl = data.nextLink
                }
            } else {
                nextUrl = null // No more pages
                console.log('No more pages - pagination complete')
            }

        } catch (error) {
            console.error('Error fetching transactions batch:', error)
            toast.error(`Failed to fetch page ${pageCount}`)
            throw error
        }
    }

    console.log(`Pagination complete. Total transactions fetched: ${allTransactions.length}`)
    return allTransactions
}
</script>

<style scoped>
/* Fix date picker visibility issues */
:deep(.v-date-picker) {
    background-color: white !important;
}

:deep(.v-date-picker .v-btn--variant-text) {
    color: #333 !important;
}

:deep(.v-date-picker .v-btn--active) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker .v-btn--selected) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker-month__day--selected) {
    background-color: #1976d2 !important;
    color: white !important;
}

:deep(.v-date-picker-month__day--today) {
    border: 2px solid #1976d2 !important;
    color: #1976d2 !important;
}

:deep(.v-date-picker-header) {
    background-color: white !important;
    color: #333 !important;
}

:deep(.v-date-picker-header .v-btn) {
    color: #333 !important;
}

:deep(.v-date-picker-month__day) {
    color: #333 !important;
}

:deep(.v-date-picker-month__weekday) {
    color: #666 !important;
}

/* Fix date input field text visibility */
:deep(.v-field__input) {
    color: #333 !important;
}

:deep(.v-field--active .v-field__input) {
    color: #333 !important;
}
</style>
