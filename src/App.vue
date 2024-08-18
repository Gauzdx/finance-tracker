<template>
  <PageHeader />
  <div class="container">
    <Balance :total="total" />
    <IncomeExpense :income="+income" :expense="+expense" />
    <TransactionList :transactions="transactions" @transactionDeleted="handleTransactionDeleted" />
    <AddTransaction @transactionSubmitted="handleTransactionSubmitted" />
  </div>
</template>

<script setup>
import PageHeader from './components/PageHeader.vue'
import Balance from './components/Balance.vue'
import IncomeExpense from './components/IncomeExpense.vue'
import TransactionList from './components/TransactionList.vue'
import AddTransaction from './components/AddTransaction.vue'

import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { ref, computed, onMounted } from 'vue'

const toast = useToast()

const transactions = ref([])

const fetchTransactions = async () => {
  try {
    const response = await api.getData()
    transactions.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchTransactions()
})

const total = computed(() => {
  return transactions.value.reduce((acc, transaction) => {
    return acc + transaction.transaction_amount
  }, 0)
})

const income = computed(() => {
  return transactions.value
    .filter((transaction) => transaction.transaction_amount >= 0)
    .reduce((acc, transaction) => {
      return acc + transaction.transaction_amount
    }, 0)
    .toFixed(2)
})

const expense = computed(() => {
  return transactions.value
    .filter((transaction) => transaction.transaction_amount < 0)
    .reduce((acc, transaction) => {
      return acc + transaction.transaction_amount
    }, 0)
    .toFixed(2)
})

//Add transaction
const handleTransactionSubmitted = (transactionData) => {
  transactions.value.push({
    transaction_id: transactionData.id,
    merchant: transactionData.merchant,
    transaction_amount: transactionData.amount
  })

  toast.success('Transaction added.')
}

//Delete transaction
const handleTransactionDeleted = (id) => {
  transactions.value = transactions.value.filter((transaction) => transaction.transaction_id !== id)

  toast.success('Transaction deleted.')
}
</script>
