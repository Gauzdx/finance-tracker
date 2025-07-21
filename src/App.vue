<template>
    <!-- Global Loading Spinner -->
    <div v-if="isInitialLoading" class="global-loading-overlay">
        <div class="global-loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text">Loading your financial data...</p>
            <div class="loading-progress">
                <div class="progress-item" :class="{ completed: transactionsLoaded, error: transactionsError }">
                    <span class="progress-icon">{{ transactionsLoaded ? '✓' : transactionsError ? '✗' : '○' }}</span>
                    Transactions
                </div>
                <div class="progress-item" :class="{ completed: categoriesLoaded, error: categoriesError }">
                    <span class="progress-icon">{{ categoriesLoaded ? '✓' : categoriesError ? '✗' : '○' }}</span>
                    Categories
                </div>
                <div class="progress-item" :class="{ completed: accountsLoaded, error: accountsError }">
                    <span class="progress-icon">{{ accountsLoaded ? '✓' : accountsError ? '✗' : '○' }}</span>
                    Accounts
                </div>
            </div>
            
            <!-- Show error message and retry button if any errors occurred -->
            <div v-if="transactionsError || categoriesError || accountsError" class="loading-error">
                <p class="error-message">Failed to load some data. Please check your connection and try again.</p>
                <button @click="retryDataFetch" class="retry-button">🔄 Retry</button>
            </div>
        </div>
    </div>

    <!-- Main App Content -->
    <div v-else>
        <PageHeader />
        <div class="container">
            <Balance :total="total" />
            <IncomeExpense :income="parseFloat(income)" :expense="parseFloat(expense)" />
            <AddTransaction :accounts="accounts" :categories="categories" :transactions="transactions"
                @transactionSubmitted="handleTransactionSubmitted" />
            <SearchTransaction :accounts="accounts" :categories="categories" @filter="handleFilter" />
            <TransactionList :accounts="accounts" :categories="categories" :transactions="filteredTransactions"
                :isLoading="isLoading" :currentPage="currentPage" :totalPages="totalPages" :totalRecords="totalRecords"
                :recordsPerPage="recordsPerPage" @transactionDeleted="handleTransactionDeleted"
                @transactionUpdated="handleTransactionUpdated" @pageChanged="goToPage" @nextPage="nextPage"
                @prevPage="prevPage" />
        </div>
    </div>
</template>

<script setup>
import PageHeader from './components/PageHeader.vue'
import Balance from './components/Balance.vue'
import IncomeExpense from './components/IncomeExpense.vue'
import TransactionList from './components/TransactionList.vue'
import AddTransaction from './components/AddTransaction.vue'
import SearchTransaction from './components/SearchTransaction.vue'

import { useToast } from 'vue-toastification'
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

const toast = useToast()

const transactions = ref([])
const accounts = ref([])
const categories = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const recordsPerPage = 100
const isLoading = ref(false)
const searchQuery = ref('')
const accountFilter = ref('')
const categoryFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')

// Global loading state
const isInitialLoading = ref(true)
const transactionsLoaded = ref(false)
const categoriesLoaded = ref(false)
const accountsLoaded = ref(false)
const transactionsError = ref(false)
const categoriesError = ref(false)
const accountsError = ref(false)

// Store pagination links for navigation
const paginationLinks = ref([])
const currentPageUrl = ref('/data-api/rest/personaltransactions?$orderby=transaction_id desc')

const fetchTransactions = async (page = 1) => {
    try {
        isLoading.value = true

        let url
        if (page === 1) {
            // First page - use base URL
            url = '/data-api/rest/personaltransactions?$orderby=transaction_id desc'
            currentPageUrl.value = url
        } else if (paginationLinks.value[page - 1]) {
            // Use stored pagination link for this page
            url = paginationLinks.value[page - 1]
        } else {
            // Need to navigate through pages to get to the desired page
            await navigateToPage(page)
            return
        }

        const response = await axios.get(url)

        transactions.value = response.data.value || []
        currentPage.value = page

        // Store the nextLink for next page navigation
        if (response.data.nextLink && !paginationLinks.value[page]) {
            const nextUrl = new URL(response.data.nextLink)
            paginationLinks.value[page] = nextUrl.pathname + nextUrl.search
        }

        // Estimate total pages (since we don't have exact count)
        if (response.data.nextLink) {
            totalPages.value = Math.max(totalPages.value, page + 1)
        } else {
            totalPages.value = page // This is the last page
        }

        totalRecords.value = (page - 1) * recordsPerPage + transactions.value.length

        console.log(`Fetched page ${page}: ${transactions.value.length} transactions`)
        
        // Mark transactions as loaded for initial load
        if (page === 1) {
            transactionsLoaded.value = true
            checkInitialLoadComplete()
        }
    } catch (error) {
        console.log('Error fetching transactions:', error)
        toast.error('Failed to fetch transactions')
        // Mark as error for initial load
        if (page === 1) {
            transactionsError.value = true
        }
        // DO NOT mark as loaded on error - keep loading spinner active
        // This will prevent the app from proceeding with incomplete data
    } finally {
        isLoading.value = false
    }
}

// Navigate through pages sequentially to reach target page
const navigateToPage = async (targetPage) => {
    try {
        isLoading.value = true
        let currentUrl = '/data-api/rest/personaltransactions?$orderby=transaction_id desc'

        for (let page = 1; page <= targetPage; page++) {
            const response = await axios.get(currentUrl)

            if (page === targetPage) {
                transactions.value = response.data.value || []
                currentPage.value = page
                totalRecords.value = (page - 1) * recordsPerPage + transactions.value.length

                if (!response.data.nextLink) {
                    totalPages.value = page
                }
                break
            }

            if (response.data.nextLink) {
                const nextUrl = new URL(response.data.nextLink)
                currentUrl = nextUrl.pathname + nextUrl.search
                paginationLinks.value[page] = currentUrl
            } else {
                // No more pages available
                totalPages.value = page
                break
            }
        }
    } catch (error) {
        console.log('Error navigating to page:', error)
        toast.error('Failed to navigate to page')
    } finally {
        isLoading.value = false
    }
}

const fetchAllCategories = async () => {
    try {
        const response = await axios.get('/data-api/rest/categories?$orderby=category_name asc')
        categories.value = response.data.value
        categoriesLoaded.value = true
        checkInitialLoadComplete()
    } catch (error) {
        console.log(error)
        toast.error('Failed to fetch categories')
        categoriesError.value = true
        // DO NOT mark as loaded on error - keep loading spinner active
        // This will prevent the app from proceeding with incomplete data
    }
}

const fetchAllAccounts = async () => {
    try {
        const response = await axios.get('/data-api/rest/accounts')
        accounts.value = response.data.value
        accountsLoaded.value = true
        checkInitialLoadComplete()
    } catch (error) {
        console.log(error)
        toast.error('Failed to fetch accounts')
        accountsError.value = true
        // DO NOT mark as loaded on error - keep loading spinner active
        // This will prevent the app from proceeding with incomplete data
    }
}

const createTransaction = async (transactionData) => {
    const roundedAmount = Math.round(transactionData[0].amount * 100) / 100
    const roundedCharge = Math.round(transactionData[0].charge * 100) / 100

    await axios.post('/data-api/rest/personaltransactions', {
        transaction_date: transactionData[0].date,
        transaction_account: transactionData[0].account,
        transaction_merchant: transactionData[0].merchant,
        transaction_category: transactionData[0].category,
        transaction_type: transactionData[0].type,
        transaction_amount: roundedAmount,
        transaction_charge: roundedCharge,
        transaction_description: transactionData[0].description
    })
}

const updateTransaction = async (transactionData) => {
    try {
        const roundedAmount = Math.round(transactionData.transaction_amount * 100) / 100
        const roundedCharge = Math.round(transactionData.transaction_charge * 100) / 100

        await axios.put('/data-api/rest/personaltransactions/transaction_id/' + transactionData.transaction_id, {
            transaction_date: transactionData.transaction_date,
            transaction_account: transactionData.transaction_account,
            transaction_merchant: transactionData.transaction_merchant,
            transaction_category: transactionData.transaction_category,
            transaction_type: transactionData.transaction_type,
            transaction_amount: roundedAmount,
            transaction_charge: roundedCharge,
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

// Check if all initial data is loaded
const checkInitialLoadComplete = () => {
    if (transactionsLoaded.value && categoriesLoaded.value && accountsLoaded.value) {
        // Add a small delay to show the completion state briefly
        setTimeout(() => {
            isInitialLoading.value = false
        }, 500)
    }
}

// Retry data fetching
const retryDataFetch = () => {
    // Store which items had errors before resetting
    const hadTransactionError = transactionsError.value
    const hadCategoryError = categoriesError.value
    const hadAccountError = accountsError.value
    
    // Reset error states
    transactionsError.value = false
    categoriesError.value = false
    accountsError.value = false
    
    // Reset loaded states for failed items
    if (hadTransactionError) transactionsLoaded.value = false
    if (hadCategoryError) categoriesLoaded.value = false
    if (hadAccountError) accountsLoaded.value = false
    
    // Retry failed requests
    if (hadTransactionError) fetchTransactions(1)
    if (hadCategoryError) fetchAllCategories()
    if (hadAccountError) fetchAllAccounts()
}

onMounted(() => {
    fetchTransactions(1) // Fetch first page
    fetchAllCategories()
    fetchAllAccounts()
})

// Filtered transactions based on search query and filters
const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Filter by merchant search
    if (searchQuery.value && searchQuery.value.trim() !== '') {
        const merchantQuery = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(transaction =>
            transaction.transaction_merchant &&
            transaction.transaction_merchant.toLowerCase().includes(merchantQuery)
        )
    }

    // Filter by account
    if (accountFilter.value && accountFilter.value.trim() !== '') {
        filtered = filtered.filter(transaction =>
            transaction.transaction_account === accountFilter.value
        )
    }

    // Filter by category
    if (categoryFilter.value && categoryFilter.value.trim() !== '') {
        filtered = filtered.filter(transaction =>
            transaction.transaction_category === categoryFilter.value
        )
    }

    // Filter by date range
    if (fromDateFilter.value && fromDateFilter.value.trim() !== '') {
        filtered = filtered.filter(transaction =>
            transaction.transaction_date >= fromDateFilter.value
        )
    }

    if (toDateFilter.value && toDateFilter.value.trim() !== '') {
        filtered = filtered.filter(transaction =>
            transaction.transaction_date <= toDateFilter.value
        )
    }

    return filtered
})

const total = computed(() => {
    return filteredTransactions.value.reduce((acc, transaction) => {
        return acc + transaction.transaction_charge
    }, 0)
})

const income = computed(() => {
    return filteredTransactions.value
        .filter((transaction) => transaction.transaction_charge >= 0)
        .reduce((acc, transaction) => {
            return acc + transaction.transaction_charge
        }, 0)
        .toFixed(2)
})

const expense = computed(() => {
    return filteredTransactions.value
        .filter((transaction) => transaction.transaction_charge < 0)
        .reduce((acc, transaction) => {
            return acc + transaction.transaction_charge
        }, 0)
        .toFixed(2)
})

//Add transaction
const handleTransactionSubmitted = async (transactionData) => {
    try {
        // Create transaction in database first
        await createTransaction(transactionData)

        // Refetch transactions to get the latest data with correct IDs
        await fetchTransactions()

        toast.success('Transaction added.')
    } catch (error) {
        console.error('Failed to add transaction:', error)
        toast.error('Failed to add transaction.')
    }
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

// Pagination functions
const goToPage = (page) => {
    if (page >= 1 && page !== currentPage.value) {
        fetchTransactions(page)
    }
}

const nextPage = () => {
    goToPage(currentPage.value + 1)
}

const prevPage = () => {
    if (currentPage.value > 1) {
        goToPage(currentPage.value - 1)
    }
}

// Handle filter functionality
const handleFilter = (filters) => {
    searchQuery.value = filters.merchant
    accountFilter.value = filters.account
    categoryFilter.value = filters.category
    fromDateFilter.value = filters.fromDate
    toDateFilter.value = filters.toDate
}
</script>
