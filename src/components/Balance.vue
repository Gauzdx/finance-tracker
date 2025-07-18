<template>
    <h4>Your Balance</h4>
    <h1 id="balance">{{ formatCurrency(total) }}</h1>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    total: {
        type: Number,
        required: true
    }
})

//Currency formatting function
const formatCurrency = (amount) => {
    if (amount < 0) {
        return `-$${Math.abs(amount)}`
    }
    return `$${amount}`
}
</script>
