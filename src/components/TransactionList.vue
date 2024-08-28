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
            <button @click="editTransaction(transaction.transaction_id)" class="edit-btn">✏️</button>
        </li>
    </ul>
</template>

<script setup>
import { defineProps } from 'vue'

const emit = defineEmits(['transactionDeleted'])

const props = defineProps({
    transactions: {
        type: Array,
        required: true
    }
})

const deleteTransaction = (id) => {
    emit('transactionDeleted', id)
}

const editTransaction = (id) => {
    console.log(id)
}
</script>
