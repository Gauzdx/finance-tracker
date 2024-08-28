<template>
    <h3>Add new transaction</h3>
    <!-- Add Transaction Popup -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn class="text-none font-weight-regular" text="💵 Add Transaction" variant="tonal" v-bind="activatorProps"></v-btn>
            </template>

            <v-card title="💵 Add Transaction">
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
                            <v-select clearable chips label="Category" v-model="trCategory" :items="categoryNames" variant="outlined"></v-select>
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

                    <v-btn color="primary" text="💾" variant="text" @click="onSaveBtnClick"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uuid } from 'vue-uuid'
import { useToast } from 'vue-toastification'
import { VDateInput } from 'vuetify/labs/VDateInput'

const datePicker = ref({
    components: {
        VDateInput
    }
})

//const trDate = ref(new Date().toISOString().slice(0, 10))
const trDate = ref(null)
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
    }
})
const accountIds = computed(() => props.accounts.map((account) => account.account_id))
const categoryNames = computed(() => props.categories.map((category) => category.category_name))

const onSaveBtnClick = () => {
    //To-do:Add form validation below

    const transactionData = []
    if (trTypeRadios.value == 'Debit') {
        transactionData.push({
            //id: uuid.v1(),
            date: trDate.value.toISOString().slice(0, 10),
            account: trAccount.value,
            merchant: trMerchant.value,
            category: trCategory.value,
            type: trTypeRadios.value,
            amount: parseFloat(trAmount.value),
            charge: parseFloat(trAmount.value) * -1,
            description: trDescription.value
        })
    } else {
        transactionData.push({
            //id: uuid.v1(),
            date: trDate.value.toISOString().slice(0, 10),
            account: trAccount.value,
            merchant: trMerchant.value,
            category: trCategory.value,
            type: trTypeRadios.value,
            amount: parseFloat(trAmount.value),
            charge: parseFloat(trAmount.value),
            description: trDescription.value
        })
    }

    //Close popup
    dialog.value = false

    console.log(transactionData)
    emit('transactionSubmitted', transactionData)
}
</script>
