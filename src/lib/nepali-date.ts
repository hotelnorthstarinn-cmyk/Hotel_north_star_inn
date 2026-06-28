import NepaliDateConverter from "nepali-date-converter"

const monthNamesBs = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
]

export function adToBs(adDate: string | Date) {
  const d = new NepaliDateConverter(new Date(adDate))
  return d.getBS() as { year: number; month: number; date: number; day: number }
}

export function adToBsFormatted(adDate: string | Date, format = "YYYY/MM/DD"): string {
  const d = new NepaliDateConverter(new Date(adDate))
  return d.format(format)
}

export function adToBsWithMonthName(adDate: string | Date): string {
  const d = new NepaliDateConverter(new Date(adDate))
  const bs = d.getBS()
  const monthName = monthNamesBs[bs.month - 1] || ""
  return `${bs.year}/${String(bs.month).padStart(2, "0")}/${String(bs.date).padStart(2, "0")} ${monthName}`
}

export function formatDateWithBoth(adDate: string | Date): string {
  const date = new Date(adDate)
  const adFormatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
  const bs = adToBsFormatted(adDate)
  return `${bs} (${adFormatted})`
}

export function todayAd(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
