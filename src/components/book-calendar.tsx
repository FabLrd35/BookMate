"use client"

import { useState } from "react"
import { FinishedBook } from "@/app/actions/calendar"
import { ChevronLeft, ChevronRight, Star, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
    getYear
} from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MonthYearPicker } from "@/components/month-year-picker"

interface BookCalendarProps {
    books: FinishedBook[]
    currentYear: number
}

export function BookCalendar({ books, currentYear }: BookCalendarProps) {
    // Initialize with the month of the last read book, or current month if no books
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (books.length > 0) {
            // Books are ordered by finishDate asc from server, so last one is latest
            const lastBook = books[books.length - 1]
            const lastBookDate = new Date(lastBook.finishDate)
            // Only use it if it matches the currentYear context
            if (getYear(lastBookDate) === currentYear) {
                return lastBookDate
            }
        }
        return new Date(currentYear, new Date().getMonth())
    })

    // Sync month if year changes
    if (getYear(currentMonth) !== currentYear) {
        // Try to find a book in this new year to focus on
        const firstBookOfYear = books.find(b => getYear(new Date(b.finishDate)) === currentYear)
        if (firstBookOfYear) {
            setCurrentMonth(new Date(firstBookOfYear.finishDate))
        } else {
            setCurrentMonth(new Date(currentYear, 0))
        }
    }

    const firstDayOfMonth = startOfMonth(currentMonth)
    const lastDayOfMonth = endOfMonth(currentMonth)
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = [
        { short: "L", long: "Lun" },
        { short: "M", long: "Mar" },
        { short: "M", long: "Mer" },
        { short: "J", long: "Jeu" },
        { short: "V", long: "Ven" },
        { short: "S", long: "Sam" },
        { short: "D", long: "Dim" }
    ]

    function nextMonth() {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    function prevMonth() {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    function getBooksForDay(day: Date) {
        return books.filter(book => isSameDay(new Date(book.finishDate), day))
    }

    const BookCover = ({ book, isSmall = false }: { book: FinishedBook, isSmall?: boolean }) => (
        <div className={cn(
            "relative rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted",
            isSmall ? "aspect-[2/3] w-full" : "aspect-[2/3] w-full"
        )}>
            {book.coverUrl ? (
                <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 15vw"
                />
            ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center p-1">
                    <span className={cn(
                        "text-center leading-tight line-clamp-3 text-muted-foreground",
                        isSmall ? "text-[6px] sm:text-[8px]" : "text-xs"
                    )}>{book.title}</span>
                </div>
            )}

            {/* Rating badge */}
            {book.rating && (
                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[6px] sm:text-[8px] px-1 py-0.5 flex items-center gap-0.5 rounded-tl backdrop-blur-[1px]">
                    <Star className="w-1.5 h-1.5 fill-yellow-400 text-yellow-400" />
                    {book.rating}
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-4">
            <MonthYearPicker
                currentDate={currentMonth}
                onDateChange={setCurrentMonth}
                maxDate={new Date()}
                className="justify-center"
            />

            <div className="grid grid-cols-7 gap-px bg-muted/20 rounded-lg overflow-hidden border">
                {/* Weekday headers */}
                {weekDays.map((day) => (
                    <div key={day.long} className="bg-muted/50 p-1 sm:p-2 text-center text-[10px] sm:text-sm font-medium text-muted-foreground">
                        <span className="sm:hidden">{day.short}</span>
                        <span className="hidden sm:inline">{day.long}</span>
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day) => {
                    const dayBooks = getBooksForDay(day)
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const hasMultipleBooks = dayBooks.length > 1
                    const displayBook = dayBooks[0]

                    const DayContent = (
                        <div
                            className={cn(
                                "min-h-[80px] sm:min-h-[120px] bg-background p-0.5 sm:p-1.5 relative transition-colors hover:bg-muted/5 flex flex-col h-full",
                                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                isToday(day) && "bg-primary/5"
                            )}
                        >
                            <span className={cn(
                                "text-[10px] sm:text-xs font-medium block mb-0.5 sm:mb-1 ml-0.5 sm:ml-1",
                                isToday(day) && "text-primary font-bold"
                            )}>
                                {format(day, "d")}
                            </span>

                            <div className="flex-1 flex flex-col justify-start items-center w-full">
                                {displayBook && (
                                    <div className="relative w-full max-w-[45px] sm:max-w-[80px]">
                                        <BookCover book={displayBook} isSmall />

                                        {hasMultipleBooks && (
                                            <div className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-sm ring-1 sm:ring-2 ring-background z-10">
                                                +{dayBooks.length - 1}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )

                    if (hasMultipleBooks) {
                        return (
                            <Dialog key={day.toString()}>
                                <DialogTrigger asChild className="cursor-pointer text-left">
                                    {DayContent}
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            Lectures du {format(day, "d MMMM yyyy", { locale: fr })}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="overflow-y-auto flex-1 pr-2">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                                            {dayBooks.map((book) => (
                                                <Link href={`/books/${book.id}`} key={book.id} className="group block">
                                                    <BookCover book={book} />
                                                    <p className="mt-2 text-xs font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                                                        {book.title}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    }

                    if (displayBook) {
                        return (
                            <Link href={`/books/${displayBook.id}`} key={day.toString()} className="block h-full">
                                {DayContent}
                            </Link>
                        )
                    }

                    return (
                        <div key={day.toString()} className="h-full">
                            {DayContent}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
