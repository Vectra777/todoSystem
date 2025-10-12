<template>
	<div class="calendar-wrapper">
		<div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
			<div class="btn-group">
				<button class="btn btn-sm btn-outline-secondary" @click="goToPrevMonth" title="Previous month">◀</button>
				<button class="btn btn-sm btn-outline-secondary" @click="goToToday" title="Current month">Today</button>
				<button class="btn btn-sm btn-outline-secondary" @click="goToNextMonth" title="Next month">▶</button>
			</div>
			<h4 class="m-0 flex-grow-1 text-center">{{ monthLabel }}</h4>
			<div>
				<button class="btn btn-sm" :class="detailed ? 'btn-primary' : 'btn-outline-secondary'" @click="detailed = !detailed">{{ detailed ? 'Detailed' : 'Compact' }}</button>
			</div>
			<div class="small text-muted text-end legend-wrapper" style="min-width:260px">Legend:
				<span class="legend-pill start">Start</span>
				<span class="legend-pill span">Span</span>
				<span class="legend-pill end">End</span>
			</div>
		</div>

		<div class="calendar-grid">
			<div class="dow" v-for="d in daysOfWeek" :key="d">{{ d }}</div>
			<div
				v-for="cell in calendarCells"
				:key="cell.key"
				class="day-cell"
				:class="{
					'other-month': !cell.inCurrentMonth,
					'today': cell.isToday
				}"
			>
				<div class="date-number">{{ cell.date.getDate() }}</div>
				<div class="tasks-list">
					<div v-if="!detailed">
						<div
							v-for="t in cell.tasks"
							:key="t.id + ':' + t.__marker"
							class="task-chip"
							:class="t.__marker"
							:title="taskChipTitle(t)"
						>
							<span class="truncate">{{ t.title }}</span>
						</div>
					</div>
					<div v-else>
						<div v-for="t in cell.tasks" :key="t.id + ':' + t.__marker" class="mb-2">
							<CompetenceCard :item="t" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<div v-if="tasksWithoutDates.length" class="mt-3">
			<details>
				<summary class="fw-semibold">Tasks without dates ({{ tasksWithoutDates.length }})</summary>
				<div v-if="!detailed" class="d-flex flex-wrap gap-2 mt-2">
					<div v-for="t in tasksWithoutDates" :key="t.id" class="task-chip no-date">{{ t.title }}</div>
				</div>
				<div v-else class="d-flex flex-wrap gap-2 mt-2">
					<div v-for="t in tasksWithoutDates" :key="t.id" class="mb-2">
						<CompetenceCard :item="t" />
					</div>
				</div>
			</details>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CompetenceCard from './CompetenceCard.vue'

const props = defineProps({
	tasks: { type: Array, default: () => [] }
})
// read-only calendar: no edit emits

const detailed = ref(false)

// State for displayed month (year, month index)
const shownYear = ref(new Date().getUTCFullYear())
const shownMonth = ref(new Date().getUTCMonth()) // 0-11

function goToPrevMonth() {
	if (shownMonth.value === 0) {
		shownMonth.value = 11
		shownYear.value--
	} else shownMonth.value--
}
function goToNextMonth() {
	if (shownMonth.value === 11) {
		shownMonth.value = 0
		shownYear.value++
	} else shownMonth.value++
}
function goToToday() {
	const now = new Date()
	shownYear.value = now.getUTCFullYear()
	shownMonth.value = now.getUTCMonth()
}

const monthLabel = computed(() => {
	return new Date(Date.UTC(shownYear.value, shownMonth.value, 1)).toLocaleDateString(undefined, {
		month: 'long',
		year: 'numeric'
	})
})

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function parseDateOnly(val) {
	if (!val) return null
	if (typeof val === 'string') {
		const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
		if (m) {
			return new Date(Date.UTC(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])))
		}
	}
	try {
		const d = new Date(val)
		if (isNaN(d)) return null
		return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
	} catch {
		return null
	}
}

const tasksAugmented = computed(() => {
	return props.tasks.map(t => ({
		...t,
		_start: parseDateOnly(t.start_date),
		_end: parseDateOnly(t.end_date)
	}))
})

const tasksWithoutDates = computed(() => tasksAugmented.value.filter(t => !t._start && !t._end))
const calendarCells = computed(() => {
	const year = shownYear.value
	const month = shownMonth.value
	const firstOfMonth = new Date(Date.UTC(year, month, 1))
	let startWeekday = firstOfMonth.getUTCDay() // 0=Sun
	// Convert to Monday=0 index
	startWeekday = (startWeekday + 6) % 7
	const firstCellDate = new Date(firstOfMonth)
	firstCellDate.setUTCDate(firstOfMonth.getUTCDate() - startWeekday)

	const cells = []
	for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
		const d = new Date(firstCellDate)
		d.setUTCDate(firstCellDate.getUTCDate() + i)
		const inCurrentMonth = d.getUTCMonth() === month
		const today = isSameDateUTC(d, new Date())
		const dayTasks = tasksForDate(d)
		cells.push({
			key: d.toISOString().slice(0, 10),
			date: d,
			inCurrentMonth,
			isToday: today,
			tasks: dayTasks
		})
	}
	return cells
})

function isSameDateUTC(a, b) {
	return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
}

function tasksForDate(dayDate) {
	const y = dayDate.getUTCFullYear()
	const m = dayDate.getUTCMonth()
	const d = dayDate.getUTCDate()
	const arr = []
	for (const t of tasksAugmented.value) {
		const hasStart = !!t._start
		const hasEnd = !!t._end
		if (!hasStart && !hasEnd) continue

		// One-day tasks (start == end)
		if (hasStart && hasEnd && isSameDateUTC(t._start, t._end) && isSameDateUTC(t._start, dayDate)) {
			arr.push({ ...t, __marker: 'start' })
			continue
		}

		if (hasStart && isSameDateUTC(t._start, dayDate)) {
			arr.push({ ...t, __marker: 'start' })
			continue
		}
		if (hasEnd && isSameDateUTC(t._end, dayDate)) {
			arr.push({ ...t, __marker: 'end' })
			continue
		}
		// Middle span days: dayDate is between start (exclusive) and end (exclusive)
		if (hasStart && hasEnd && dayDate > t._start && dayDate < t._end) {
			arr.push({ ...t, __marker: 'span' })
		}
	}
	return arr
}

function taskChipTitle(t) {
	let marker = ''
	if (t._start && t._end && isSameDateUTC(t._start, t._end)) marker = 'One-day task'
	else if (t.__marker === 'start') marker = 'Start'
	else if (t.__marker === 'end') marker = 'End'
	else if (t.__marker === 'span') marker = 'In progress'
	const base = `${t.title}`
	return marker ? `${base} (${marker})` : base
}

function originalTask(chipTask) {
	return props.tasks.find(tt => tt.id === chipTask.id) || chipTask
}
</script>

<style scoped>
.calendar-wrapper {
	background: var(--bs-body-bg);
	border: 1px solid var(--bs-border-color);
	border-radius: .5rem;
	padding: 1rem;
}
.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4px;
	user-select: none;
}
.dow {
	font-weight: 600;
	text-align: center;
	padding: .25rem 0;
	font-size: .85rem;
	text-transform: uppercase;
}

.day-cell {
	position: relative;
	min-height: 110px;
	border: 1px solid var(--bs-border-color);
	border-radius: .35rem;
	padding: .25rem .25rem .5rem;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.day-cell.other-month { opacity: .45; }
.day-cell.today { outline: 2px solid var(--bs-primary); outline-offset: -2px; }
.date-number { font-size: .8rem; font-weight: 600; margin-bottom: .25rem; }
.tasks-list { display: flex; flex-direction: column; gap: 2px; overflow: auto; }
.task-chip { cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: .65rem; line-height: 1.2; font-weight: 500; background: var(--bs-secondary-bg); color: var(--bs-emphasis-color); border-left: 4px solid var(--bs-secondary); }
.task-chip.start { border-left-color: var(--bs-primary); background: var(--bs-primary-bg-subtle); }
.task-chip.span { border-left-color: var(--bs-success); background: var(--bs-success-bg-subtle); }
.task-chip.end { border-left-color: var(--bs-danger); background: var(--bs-danger-bg-subtle); }
.task-chip.no-date { border-left-color: var(--bs-indigo); background: var(--bs-indigo-bg-subtle); }
.legend-wrapper .legend-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: .65rem; margin-left: 4px; border-left: 4px solid; background: var(--bs-tertiary-bg); }
.legend-pill.start { border-left-color: var(--bs-primary); }
.legend-pill.span { border-left-color: var(--bs-success); }
.legend-pill.end { border-left-color: var(--bs-danger); }
.task-chip:hover { filter: brightness(0.95); }
.truncate { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 992px) {
	.day-cell { min-height: 90px; }
	.task-chip { font-size: .55rem; }
}
</style>