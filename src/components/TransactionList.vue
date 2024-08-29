<template>
    <h3>History</h3>
    <ul id="list" class="list">
        <li v-for="transaction in transactions" :key="transaction.transaction_id" :class="transaction.transaction_charge < 0 ? 'minus' : 'plus'">
            <span>{{ transaction.transaction_date }}</span>
            <span>{{ transaction.transaction_account }}</span>
            <span>{{ transaction.transaction_merchant }}</span>
            <span>{{ transaction.transaction_category }}</span>
            <span>${{ transaction.transaction_charge }}</span>
            <button @click="deleteTransaction(transaction.transaction_id)" class="delete-btn">❌</button>
            <button @click="editTransaction(transaction)" class="edit-btn">✏️</button>
        </li>
    </ul>
    <!-- Edit Transaction popup -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <v-card title="💵 Edit Transaction">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="4" sm="6">
                            <v-date-input label="Date" v-model="trDate" prepend-inner-icon="$calendar" prepend-icon="" variant="outlined"></v-date-input>
                        </v-col>

                        <v-col cols="12" md="8" sm="6">
                            <v-select clearable chips label="Account" v-model="trAccount" :items="accountIds" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" md="8" sm="6">
                            <v-text-field clearable label="Merchant" v-model="trMerchant" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4" sm="6">
                            <v-select chips label="Category" v-model="trCategory" :items="categoryNames" variant="outlined"></v-select>
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
                            <v-text-field clearable label="Amount" v-model="trAmount" prefix="$" variant="outlined"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <v-textarea clearable label="Description" v-model="trDescription" variant="outlined" rows="2"></v-textarea>
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

const trId = ref(null)
const trDate = ref(null)
const trDateInMS = ref(null)
const trAccount = ref(null)
const trMerchant = ref(null)
const trCategory = ref(null)
const trTypeRadios = ref(null)
const trAmount = ref(null)
const trCharge = ref(null)
const trDescription = ref(null)
const dialog = ref(false)

const emit = defineEmits(['transactionDeleted', 'transactionUpdated'])

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
    }
})

const accountIds = computed(() => props.accounts.map((account) => account.account_id))
const categoryNames = computed(() => props.categories.map((category) => category.category_name))

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
    let updatedCharge = trAmount.value
    if (trTypeRadios.value === 'Debit') {
        updatedCharge = trAmount.value * -1
    } else {
        updatedCharge = Math.abs(trAmount.value)
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
        transaction_amount: parseFloat(trAmount.value),
        transaction_charge: parseFloat(updatedCharge),
        transaction_description: trDescription.value
    })

    dialog.value = false
}

const deleteTransaction = (id) => {
    emit('transactionDeleted', id)
}

//Date function
const formatDateFromMilliseconds = (milliseconds) => {
    const date = new Date(milliseconds)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}
</script>
