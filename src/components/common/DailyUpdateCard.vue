<script lang="ts">
export default { name: "DailyUpdateCard" };
</script>

<script setup lang="ts">
import { NImage, NImageGroup } from "naive-ui";
import { Icon } from "@iconify/vue";
import { computed } from "vue";

export interface DailyUpdateItem {
    id: string;
    date: string;
    engineer_id: string;
    engineer: { id: string; first_name: string; last_name: string };
    work_done: string;
    issues: string;
    images: { id: string; url: string }[];
    created_at: string;
}

const props = defineProps<{
    update: DailyUpdateItem;
    phase: string;
    avatarBg: string;
    avatarFg: string;
}>();

const initials = computed(() => {
    if (!props.update.engineer) return "?";
    const f = props.update.engineer.first_name?.[0] ?? "";
    const l = props.update.engineer.last_name?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
});
</script>

<template>
    <div class="bg-white rounded-xl p-4" style="border: 0.5px solid #e3e1d8">
        <!-- Engineer -->
        <div class="flex items-center gap-2.5 mb-3">
            <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :style="{ background: avatarBg, color: avatarFg }"
            >
                {{ initials }}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">
                    {{ update.engineer.first_name }}
                    {{ update.engineer.last_name }}
                </div>
                <span
                    class="inline-flex items-center h-4 px-1.5 rounded-full text-[11px] font-medium mt-0.5"
                    style="background: #e1f5ee; color: #0f6e56"
                >
                    {{ phase }}
                </span>
            </div>
        </div>

        <!-- Work done -->
        <div
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
        >
            สิ่งที่ทำ
        </div>
        <div
            class="text-sm text-gray-700 leading-relaxed"
            :class="update.issues ? 'mb-3' : ''"
        >
            {{ update.work_done }}
        </div>

        <!-- Issues -->
        <div
            v-if="update.issues"
            class="flex items-start gap-2 rounded-lg p-2.5 mt-2"
            style="background: #fcebeb"
        >
            <Icon
                icon="lucide:alert-triangle"
                style="
                    width: 13px;
                    height: 13px;
                    color: #a32d2d;
                    margin-top: 1px;
                    flex-shrink: 0;
                "
            />
            <div class="text-xs leading-relaxed" style="color: #a32d2d">
                {{ update.issues }}
            </div>
        </div>

        <!-- Photos -->
        <div v-if="update.images?.length" class="mt-3">
            <NImageGroup>
                <div class="flex gap-2 flex-wrap">
                    <NImage
                        v-for="img in update.images"
                        :key="img.id"
                        :src="img.url"
                        width="80"
                        height="60"
                        object-fit="cover"
                        class="rounded-lg overflow-hidden cursor-pointer"
                    />
                </div>
            </NImageGroup>
        </div>
    </div>
</template>
