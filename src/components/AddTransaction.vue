<template>
    <h3>Add new transaction</h3>
    <form id="form" @submit.prevent="onSubmit">
        <div class="form-control">
            <label for="text">Merchant</label>
            <input type="text" id="text" v-model="merchant" placeholder="Enter merchant name..." />
        </div>
        <div class="form-control">
            <label for="amount">Amount <br /> </label>
            <input type="text" id="amount" v-model="amount" placeholder="Enter amount..." />
        </div>
        <button class="btn">Add transaction</button>
    </form>
</template>

<script setup>
import { ref } from 'vue'
import { uuid } from 'vue-uuid'
import { useToast } from 'vue-toastification'

const merchant = ref('')
const amount = ref('')

const toast = useToast()
const emit = defineEmits(['transactionSubmitted'])

const onSubmit = () => {
    if (!merchant.value || !amount.value) {
        toast.error('Both fields must be filled.')
        return
    }

    const transactionData = {
        id: uuid.v1(),
        merchant: merchant.value,
        amount: parseFloat(amount.value)
    }

    emit('transactionSubmitted', transactionData)
}
</script>
