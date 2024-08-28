<template>
    <PageHeader />
    <div class="container">
        <Balance :total="total" />
        <IncomeExpense :income="+income" :expense="+expense" />
        <TransactionList :transactions="transactions" @transactionDeleted="handleTransactionDeleted" />
        <AddTransaction :accounts="accounts" :categories="categories" @transactionSubmitted="handleTransactionSubmitted" />
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

const insertTransaction = async (transactionData) => {
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
    } catch (error) {
        console.error('Error inserting data:', error)
    }
}

const deleteTransaction = async (id) => {
    try {
        await axios.delete('/data-api/rest/personaltransactions/transaction_id/' + id)
    } catch (error) {
        console.error('Error inserting data:', error)
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
    insertTransaction(transactionData)

    toast.success('Transaction added.')
}

//Delete transaction
const handleTransactionDeleted = (id) => {
    transactions.value = transactions.value.filter((transaction) => transaction.transaction_id !== id)
    deleteTransaction(id)

    toast.success('Transaction deleted.')
}
</script>
