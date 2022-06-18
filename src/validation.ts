import dayjs, { Dayjs } from "dayjs"
import isBetween from "dayjs/plugin/isBetween"

export interface QueryParams {
	date?: string
	status?: string
	teacherIds?: string
	studentsCount?: string
	page?: string
	lessonsPerPage?: string
}

dayjs.extend(isBetween)

const getLessonsValidation = (query: QueryParams) => {
	let { date, status, teacherIds, studentsCount, page, lessonsPerPage } = query
	// Date
	if (date?.length) {
		if (date?.includes(",")) {
			let dates = date.split(",")
			if (!(dayjs(dates[0], "YYYY-MM-DD").isValid() && dayjs(dates[1], "YYYY-MM-DD").isValid())) {
				throw new Error("Please include a valid date.")
			}
			if (dayjs(dates[0]).diff(dates[1]) < 0) {
				throw new Error("Date 1 must be greater than the date 2.")
			}
		} else {
			if (!dayjs(date, "YYYY-MM-DD").isValid()) {
				throw new Error("Please include a valid date.")
			}
		}
	}
	// Status
	if (status?.length) {
		if (isNaN(Number(status)) || (Number(status) !== 1 && Number(status) !== 0)) {
			throw new Error("Please include a valid status (0 or 1).")
		}
	}
	// Teacher ids
	if (teacherIds?.length) {
		let teacherIdsArray = teacherIds.split(",")
		teacherIdsArray.forEach(id => {
			if (isNaN(Number(id))) {
				throw new Error("Please include a valid teacher id.")
			}
		})
	}
	// Students count
	if (studentsCount?.length) {
		if (studentsCount.includes(",")) {
			let [count1, count2] = studentsCount.split(",").map(count => Number(count))
			if (isNaN(count1) || isNaN(count2) || count1 < 0 || count2 < 0) {
				throw new Error("Please include valid student count.")
			}
			if (count1 > count2) {
				throw new Error("The second student count must be greater than the first.")
			}
		} else {
			if (isNaN(Number(studentsCount)) || Number(studentsCount) < 0) {
				throw new Error("Please include a valid student count.")
			}
		}
	}
	// Page number
	if (page?.length) {
		if (isNaN(Number(page)) || Number(page) < 0) {
			throw new Error("Please include a valid page number.")
		}
	}
	// Lessons per page
	if (lessonsPerPage?.length) {
		if (isNaN(Number(lessonsPerPage)) || Number(lessonsPerPage) < 0) {
			throw new Error("Please include a valid lessons per page number.")
		}
	}
}

export interface Body {
	teacherIds: number[]
	title: string
	days: number[]
	firstDate: string
	lessonsCount: number
	lastDate: string
}
const createLessonValidation = (body: Body) => {
	const { teacherIds, title, days, firstDate, lessonsCount, lastDate } = body
	if (!teacherIds?.length) {
		throw new Error("Teacher ids are required.")
	}
	if (typeof teacherIds !== "object") {
		throw new Error("Teacher ids must be an array.")
	}
	teacherIds.forEach((id: number) => {
		if (isNaN(id)) {
			throw new Error("Please include valid teacher ids.")
		}
	})

	if (!title) {
		throw new Error("Lesson title is required.")
	}
	if (!days || !days.length) {
		throw new Error("Days required.")
	}
	days.forEach((day: number) => {
		if (isNaN(day) || day < 0 || day > 6) {
			throw new Error("Please include valid days of weeks (0 to 6).")
		}
	})
	if (!firstDate) {
		throw new Error("firstDate is required.")
	}
	if (!dayjs(firstDate, "yyyy-mm-dd").isValid()) {
		throw new Error("Please include a valid firstDate (format: yyyy-mm-dd).")
	}
	if ((lastDate && lessonsCount) || (!lastDate && !lessonsCount)) {
		throw new Error("Please include either lastDate or lessonsCount.")
	}
	if (lastDate && !dayjs(firstDate, "yyyy-mm-dd").isValid()) {
		throw new Error("Please include a valid lastDate (format: yyyy-mm-dd).")
	}
	if (lessonsCount && isNaN(lessonsCount)) {
		throw new Error("Please include a valid lessonsCount.")
	}
}

export { getLessonsValidation, createLessonValidation }
