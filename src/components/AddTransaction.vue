<template>
    <h3>Add new transaction</h3>
    <form id="form" @submit.prevent="onSubmit">
        <div class="form-control">
            <label for="text">Merchant</label>
            <input type="text" id="text" v-model="merchant" placeholder="Enter merchant name..." />
        </div>
        <div class="form-control">
            <label for="amount">Amount <br /> </label>
            <input type="text" id="amount" v-model="charge" placeholder="Enter amount..." />
        </div>
        <button class="btn">Add transaction</button>
    </form>

    <!-- Add Transaction Popup -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn class="text-none font-weight-regular" text="Add Transaction" variant="tonal" v-bind="activatorProps"></v-btn>
            </template>

            <v-card title="💵 Add Transaction">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="4" sm="6">
                            <v-text-field clearable label="Date" variant="outlined"></v-text-field>
                        </v-col>

                        <v-col cols="12" md="8" sm="6">
                            <v-select clearable chips label="Account" :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" md="8" sm="6">
                            <v-text-field clearable label="Merchant" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4" sm="6">
                            <v-select clearable chips label="Category" :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6" sm="6">
                            <v-radio-group v-model="trctnTypeRadios" inline>
                                <v-radio label="Debit" value="radioDebit"></v-radio>
                                <v-radio label="Credit" value="radioCredit"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field clearable label="Amount" prefix="$" variant="outlined"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <v-textarea clearable label="Description" variant="outlined"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

                    <v-btn color="primary" text="Save" variant="tonal" @click="dialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { uuid } from 'vue-uuid'
import { useToast } from 'vue-toastification'

const merchant = ref('')
const charge = ref('')
const dialog = ref(false)
const trctnTypeRadios = ref('radioDebit')

const toast = useToast()
const emit = defineEmits(['transactionSubmitted'])

const onSubmit = () => {
    if (!merchant.value || !charge.value) {
        toast.error('Both fields must be filled.')
        return
    }

    const transactionData = {
        id: uuid.v1(),
        merchant: merchant.value,
        charge: parseFloat(charge.value)
    }

    emit('transactionSubmitted', transactionData)
}
</script>
