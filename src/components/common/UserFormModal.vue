<script lang="ts">
export default { name: 'UserFormModal' }
</script>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NSwitch,
    NButton, NDivider, NTag,
    type FormInst, type FormRules,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { ROLE_OPTIONS, type User, type UserForm } from '@/types/user';
import { useBreakpoint } from '@/composables/useBreakpoint';
import { ROLE_META } from '@/lib/user';

const props = defineProps<{ show: boolean; editing: User | null }>()
const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': [form: UserForm, id: number | null]
}>()

const { isMobile } = useBreakpoint()
const formRef = ref<FormInst | null>(null)
const showPass = ref(false)

const form = reactive<UserForm>({
    username: '', email: '', first_name: '', last_name: '',
    role: null, password: '', is_active: true,
})

watch(() => props.editing, (user) => {
    if (user) {
        Object.assign(form, {
            username: user.username, email: user.email,
            first_name: user.first_name, last_name: user.last_name,
            role: user.role, password: '', is_active: user.is_active
        })
    } else {
        Object.assign(form, {
            username: '', email: '', first_name: '', last_name: '',
            role: null, password: '', is_active: true
        })
    }
    showPass.value = false
    formRef.value?.restoreValidation()
}, { immediate: true })

const isEdit = computed(() => props.editing !== null)
const modalTitle = computed(() => isEdit.value ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้งานใหม่')
const fullName = computed(() => [form.first_name, form.last_name].filter(Boolean).join(' '))

// Modal width: full on mobile, fixed on tablet+
const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;height:100%;margin:0;border-radius:0;top:0'
        : 'width:520px;border-radius:16px'
)

const rules = computed<FormRules>(() => ({
    first_name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกชื่อ' }],
    last_name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกนามสกุล' }],
    email: [
        { required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกอีเมล' },
        { type: 'email', trigger: ['blur', 'input'], message: 'รูปแบบอีเมลไม่ถูกต้อง' },
    ],
    username: [
        { required: true, trigger: ['blur', 'input'], message: 'กรุณากรอก username' },
        { pattern: /^[a-zA-Z0-9_.]+$/, trigger: ['blur', 'input'], message: 'ใช้ได้เฉพาะ a-z 0-9 _ .' },
    ],
    password: isEdit.value ? [] : [
        { required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกรหัสผ่าน' },
        { min: 8, trigger: ['blur', 'input'], message: 'อย่างน้อย 8 ตัวอักษร' },
    ],
    role: [{ required: true, type: 'any', trigger: 'change', message: 'กรุณาเลือก Role' }],
}))

function close() { emit('update:show', false) }
async function handleSubmit() {
    try { await formRef.value?.validate() } catch { return }
    emit('saved', { ...form }, props.editing?.id ?? null)
    close()
}
</script>

<template>
    <NModal :show="show" preset="card" :title="modalTitle" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" @update:show="emit('update:show', $event)">
        <!-- Preview strip -->
        <div class="flex items-center gap-3 p-3 rounded-xl mb-5" style="background:#F7F6F2">
            <UserAvatar :first-name="form.first_name" :last-name="form.last_name" :username="form.username"
                :size="48" />
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ fullName || 'ชื่อ-นามสกุล' }}</div>
                <div class="text-xs text-gray-400 truncate">{{ form.email || 'อีเมล' }}</div>
            </div>
            <NTag v-if="form.role" :type="ROLE_META[form.role].type" size="small" round>
                {{ ROLE_META[form.role].label }}
            </NTag>
        </div>

        <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging"
            size="medium">

            <!-- Name: side-by-side on tablet+, stacked on mobile -->
            <div :class="isMobile() ? 'flex flex-col' : 'grid grid-cols-2 gap-x-4'">
                <NFormItem label="ชื่อ" path="first_name">
                    <NInput v-model:value="form.first_name" placeholder="สมชาย" />
                </NFormItem>
                <NFormItem label="นามสกุล" path="last_name">
                    <NInput v-model:value="form.last_name" placeholder="ใจดี" />
                </NFormItem>
            </div>

            <NFormItem label="อีเมล" path="email">
                <NInput v-model:value="form.email" placeholder="somchai@company.com">
                    <template #prefix>
                        <Icon icon="lucide:mail" style="width:14px;height:14px;color:#B4B2A9" />
                    </template>
                </NInput>
            </NFormItem>

            <NDivider style="margin:4px 0 16px" />

            <NFormItem label="Username" path="username">
                <NInput v-model:value="form.username" placeholder="somchai.j">
                    <template #prefix>
                        <Icon icon="lucide:at-sign" style="width:14px;height:14px;color:#B4B2A9" />
                    </template>
                </NInput>
            </NFormItem>

            <NFormItem :label="isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'" path="password">
                <NInput v-model:value="form.password" :type="showPass ? 'text' : 'password'"
                    placeholder="อย่างน้อย 8 ตัวอักษร">
                    <template #prefix>
                        <Icon icon="lucide:lock" style="width:14px;height:14px;color:#B4B2A9" />
                    </template>
                    <template #suffix>
                        <Icon :icon="showPass ? 'lucide:eye-off' : 'lucide:eye'"
                            style="width:14px;height:14px;color:#B4B2A9;cursor:pointer" @click="showPass = !showPass" />
                    </template>
                </NInput>
            </NFormItem>

            <NDivider style="margin:4px 0 16px" />

            <!-- Role cards: 1 col on mobile, 2 cols on tablet+ -->
            <NFormItem label="Role" path="role">
                <div :class="['grid gap-2 w-full', isMobile() ? 'grid-cols-1' : 'grid-cols-2']">
                    <div v-for="opt in ROLE_OPTIONS" :key="opt.value"
                        class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
                        :style="{
                            border: form.role === opt.value ? '1.5px solid #1D9E75' : '0.5px solid #E3E1D8',
                            background: form.role === opt.value ? '#E1F5EE' : '#fff',
                        }" @click="form.role = opt.value">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            :style="{ background: opt.bg }">
                            <Icon :icon="opt.icon" :style="{ width: '15px', height: '15px', color: opt.color }" />
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-800">{{ opt.label }}</div>
                            <div class="text-xs text-gray-400">{{ opt.desc }}</div>
                        </div>
                    </div>
                </div>
            </NFormItem>

            <NFormItem v-if="isEdit" label="สถานะการใช้งาน">
                <div class="flex items-center gap-3">
                    <NSwitch v-model:value="form.is_active">
                        <template #checked>เปิดใช้งาน</template>
                        <template #unchecked>ปิดใช้งาน</template>
                    </NSwitch>
                    <span class="text-xs text-gray-400">
                        {{ form.is_active ? 'ผู้ใช้เข้าสู่ระบบได้ตามปกติ' : 'ผู้ใช้ถูกระงับการเข้าสู่ระบบ' }}
                    </span>
                </div>
            </NFormItem>
        </NForm>

        <template #footer>
            <div class="flex gap-2" :class="isMobile() ? 'flex-col' : 'justify-end'">
                <NButton :block="isMobile()" @click="close">ยกเลิก</NButton>
                <NButton :block="isMobile()" type="primary" style="background:#0F6E56;border:none"
                    @click="handleSubmit">
                    {{ isEdit ? 'บันทึก' : 'สร้างผู้ใช้งาน' }}
                </NButton>
            </div>
        </template>
    </NModal>
</template>