<template>
    <PageHeader />
    <div class="container">
        <Balance :total="total" />
        <IncomeExpense :income="+income" :expense="+expense" />
        <AddTransaction :accounts="accounts" :categories="categories" @transactionSubmitted="handleTransactionSubmitted" />
        <TransactionList :accounts="accounts" :categories="categories" :transactions="transactions" @transactionDeleted="handleTransactionDeleted" @transactionUpdated="handleTransactionUpdated" />
    </div>
</template>

<script setup>
import PageHeader from './components/PageHeader.vue'
import Balance from './components/Balance.vue'
import IncomeExpense from './components/IncomeExpense.vue'
import TransactionList from './components/TransactionList.vue'
import AddTransaction from './components/AddTransaction.vue'

import { useToast } from 'vue-toastification'
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

const toast = useToast()

const transactions = ref([])
const accounts = ref([])
const categories = ref([])

const fetchTransactions = async () => {
    try {
        const response = await axios.get('/data-api/rest/personaltransactions')
        transactions.value = response.data.value
        console.log(`transaction`)
        console.log(transactions.value)
    } catch (error) {
        console.log(error)
    }
}

const fetchAllCategories = async () => {
    try {
        const response = await axios.get('/data-api/rest/categories')
        categories.value = response.data.value
    } catch (error) {
        console.log(error)
    }
}

const fetchAllAccounts = async () => {
    try {
        const response = await axios.get('/data-api/rest/accounts')
        accounts.value = response.data.value
    } catch (error) {
        console.log(error)
    }
}

const createTransaction = async (transactionData) => {
    try {
        await axios.post('/data-api/rest/personaltransactions', {
            transaction_date: transactionData[0].date,
            transaction_account: transactionData[0].account,
            transaction_merchant: transactionData[0].merchant,
            transaction_category: transactionData[0].category,
            transaction_type: transactionData[0].type,
            transaction_amount: transactionData[0].amount,
            transaction_charge: transactionData[0].charge,
            transaction_description: transactionData[0].description
        })
        toast.success('Transaction added.')
    } catch (error) {
        console.error('Error creating data:', error)
        toast.error('Error creating transaction.')
    }
}

const updateTransaction = async (transactionData) => {
    try {
        await axios.put('/data-api/rest/personaltransactions/transaction_id/' + transactionData.transaction_id, {
            transaction_date: transactionData.transaction_date,
            transaction_account: transactionData.transaction_account,
            transaction_merchant: transactionData.transaction_merchant,
            transaction_category: transactionData.transaction_category,
            transaction_type: transactionData.transaction_type,
            transaction_amount: transactionData.transaction_amount,
            transaction_charge: transactionData.transaction_charge,
            transaction_description: transactionData.transaction_description
        })
        toast.success('Transaction edited.')
    } catch (error) {
        console.error('Error updating transaction:', error)
        toast.error('Error updating transaction.')
    }
}

const deleteTransaction = async (id) => {
    try {
        await axios.delete('/data-api/rest/personaltransactions/transaction_id/' + id)
        toast.success('Transaction deleted.')
    } catch (error) {
        console.error('Error deleting data:', error)
        toast.error('Error deleting transaction.')
    }
}

onMounted(() => {
    fetchTransactions()
    fetchAllCategories()
    fetchAllAccounts()
})

const total = computed(() => {
    return transactions.value.reduce((acc, transaction) => {
        return acc + transaction.transaction_charge
    }, 0)
})

const income = computed(() => {
    return transactions.value
        .filter((transaction) => transaction.transaction_charge >= 0)
        .reduce((acc, transaction) => {
            return acc + transaction.transaction_charge
        }, 0)
        .toFixed(2)
})

const expense = computed(() => {
    return transactions.value
        .filter((transaction) => transaction.transaction_charge < 0)
        .reduce((acc, transaction) => {
            return acc + transaction.transaction_charge
        }, 0)
        .toFixed(2)
})

//Add transaction
const handleTransactionSubmitted = (transactionData) => {
    transactions.value.push({
        transaction_date: transactionData[0].date,
        transaction_account: transactionData[0].account,
        transaction_merchant: transactionData[0].merchant,
        transaction_category: transactionData[0].category,
        transaction_type: transactionData[0].type,
        transaction_amount: transactionData[0].amount,
        transaction_charge: transactionData[0].charge,
        transaction_description: transactionData[0].description
    })
    createTransaction(transactionData)
}

//Update Transaction
const handleTransactionUpdated = (updatedTransaction) => {
    const index = transactions.value.findIndex((transaction) => transaction.transaction_id === updatedTransaction.transaction_id)
    if (index !== -1) {
        transactions.value[index] = {
            ...transactions.value[index],
            ...updatedTransaction
        }
    }
    updateTransaction(updatedTransaction)
}

//Delete transaction
const handleTransactionDeleted = (id) => {
    transactions.value = transactions.value.filter((transaction) => transaction.transaction_id !== id)
    deleteTransaction(id)
}
</script>
