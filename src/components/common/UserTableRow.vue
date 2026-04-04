<script lang="ts">
export default { name: 'UserTableRow' }
</script>

<script setup lang="ts">
import { NSwitch, NButton, NTooltip, NPopconfirm, NSpace } from 'naive-ui'
import { Icon } from '@iconify/vue'
import type { User } from '@/types/user';

defineProps<{ user: User }>()

const emit = defineEmits<{
    edit: [user: User]
    delete: [user: User]
    toggle: [user: User]
}>()
</script>

<template>
    <tr style="border-bottom:0.5px solid #F7F6F2">
        <!-- User -->
        <td style="padding:12px 16px">
            <div style="display:flex;align-items:center;gap:12px">
                <UserAvatar :first-name="user.first_name" :last-name="user.last_name" :username="user.username"
                    :size="36" />
                <div>
                    <div style="font-size:13px;font-weight:500;color:#2C2C2A">
                        {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div style="font-size:12px;color:#B4B2A9">{{ user.username }}</div>
                </div>
            </div>
        </td>

        <!-- Email -->
        <td style="padding:12px 16px;font-size:13px;color:#5F5E5A">{{ user.email }}</td>

        <!-- Role -->
        <td style="padding:12px 16px;width:130px">
            <UserRoleTag :role="user.role" />
        </td>

        <!-- Active toggle -->
        <td style="padding:12px 16px;width:120px">
            <NSwitch :value="user.is_active" size="small" @update:value="emit('toggle', user)">
                <template #checked>เปิด</template>
                <template #unchecked>ปิด</template>
            </NSwitch>
        </td>

        <!-- Created at -->
        <td style="padding:12px 16px;width:130px;font-size:12px;color:#B4B2A9">
            {{ user.created_at }}
        </td>

        <!-- Actions -->
        <td style="padding:12px 16px;width:90px;text-align:right">
            <NSpace size="small" justify="end">
                <NTooltip placement="top">
                    <template #trigger>
                        <NButton quaternary circle size="small" @click="emit('edit', user)">
                            <template #icon>
                                <Icon icon="lucide:pencil" style="width:14px;height:14px" />
                            </template>
                        </NButton>
                    </template>
                    แก้ไข
                </NTooltip>

                <NPopconfirm positive-text="ลบ" negative-text="ยกเลิก" :positive-button-props="{ type: 'error' }"
                    @positive-click="emit('delete', user)">
                    <template #trigger>
                        <NButton quaternary circle size="small" type="error">
                            <template #icon>
                                <Icon icon="lucide:trash-2" style="width:14px;height:14px" />
                            </template>
                        </NButton>
                    </template>
                    ลบ {{ user.first_name }} ออกจากระบบ?
                </NPopconfirm>
            </NSpace>
        </td>
    </tr>
</template>