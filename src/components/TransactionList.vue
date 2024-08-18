<template>
    <h3>History</h3>
    <ul id="list" class="list">
        <li
            v-for="transaction in transactions"
            :key="transaction.transaction_id"
            :class="transaction.transaction_amount < 0 ? 'minus' : 'plus'"
        >
            {{ transaction.merchant }} <span>${{ transaction.transaction_amount }}</span>
            <button @click="deleteTransaction(transaction.transaction_id)" class="delete-btn">
                x
            </button>
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
</script>
