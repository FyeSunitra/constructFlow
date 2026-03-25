<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = () => {
    auth.login()
    router.push('/dashboard')
}
</script>

<template>
    <div class="flex min-h-screen">
        <div class="hidden md:flex w-1/2 bg-[var(--primary)] 
                flex-col justify-center items-center text-white p-10">

            <img src="/logoWhite.png" class="w-64 mb-6" />

            <h1 class="text-2xl font-semibold text-center">
                บริษัท ปรมธร กรุ๊ป จำกัด
            </h1>
        </div>

        <div class="w-full md:w-1/2 flex items-center justify-center">

            <div class="w-full max-w-md px-6">

                <div class="flex flex-col items-center mb-8">
                    <img src="/logoPNG.png" class="w-40 mb-4" />

                    <p class="text-xl 0 mb-2">
                        บริษัท ปรมธร กรุ๊ป จำกัด
                    </p>

                    <h2 class="text-4xl font-bold text-[var(--primary)] drop-shadow mt-2">
                        Log in
                    </h2>
                </div>
                <div class="space-y-5">
                    <n-input v-model:value="email" placeholder="Email" size="large" class="shadow-md rounded-xl" />
                    <div class="relative">
                        <n-input v-model:value="password" :type="showPassword ? 'text' : 'password'"
                            placeholder="Password" size="large" class="shadow-md rounded-xl pr-10" />

                        <span class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                            @click="showPassword = !showPassword">
                            <Icon :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" width="20" />
                        </span>
                    </div>
                    <n-button block size="large" class="rounded-xl shadow-md"
                        style="background-color: var(--primary); color: white;" @click="handleLogin">
                        Sign in
                    </n-button>
                </div>
            </div>

        </div>

    </div>
</template>