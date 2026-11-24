import {
  C,
  DISPLAY,
  rect,
  circle,
  line,
  text,
  wrap,
  icon,
  badge,
  button,
  avatar,
  card,
  statCard,
  pageHeader,
  searchField,
  selectField,
  tabs,
  tableFrame,
  tableRowDivider,
  bookCover,
  appShell,
  textField,
  sectionTitle,
} from './kit.mjs'

const user = { name: 'Juan Dela Cruz', label: 'Student' }

function coverRow(book, x, y, w, options = {}) {
  const { due, status, tone, title, author, action } = options
  let out = bookCover(x, y, 40, { title: title || book, category: options.category || 'Fiction', h: 56 })
  out += text(x + 54, y + 16, title || book, { size: 12.5, weight: 600, fill: C.ink })
  out += text(x + 54, y + 32, author || 'Author', { size: 10, fill: C.inkFaint })
  if (due) out += text(x + 54, y + 49, due, { size: 10, fill: C.inkMuted })
  if (status) out += badge(x + w, y + 8, status, { tone, anchor: 'end' })
  if (action) out += text(x + w, y + 48, action, { size: 10.5, weight: 600, fill: C.forest700, anchor: 'end' })
  return out
}

export const studentScreens = [
  {
    id: '07-student-dashboard',
    group: 'Student',
    title: 'Student dashboard',
    note: 'Loans on the left, catalog suggestions stacked on the right.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Student dashboard',
        title: 'Good afternoon, Juan',
        description: 'Here is what is due, what is waiting for approval, and what to read next.',
        actions: [{ label: 'Browse catalog', iconName: 'library', w: 150 }],
      })

      c += rect(0, 92, 1120, 58, { fill: C.brass50, stroke: C.brass200, rx: 14 })
      c += circle(30, 121, 15, { fill: C.brass100 })
      c += icon('inbox', 21, 112, 18, C.brass700)
      c += text(58, 116, '2 borrow requests are waiting for desk approval', { size: 13, weight: 600, fill: C.brass900 })
      c += text(58, 133, 'The copies stay available until a librarian approves them.', { size: 10.5, fill: C.brass800 })
      c += button(940, 105, 'View requests', { variant: 'secondary', w: 150, h: 32, size: 12 })

      c += statCard(0, 172, 268, { label: 'On loan', value: '3', hint: '2 due within the week', iconName: 'bookopen', tone: 'forest' })
      c += statCard(284, 172, 268, { label: 'Pending requests', value: '2', hint: 'Awaiting librarian review', iconName: 'inbox', tone: 'brass' })
      c += statCard(568, 172, 268, { label: 'Due soon', value: '1', hint: 'The Great Gatsby · Nov 9', iconName: 'clock', tone: 'cream' })
      c += statCard(852, 172, 268, { label: 'Unpaid fines', value: '₱25', hint: 'Blocks new requests', iconName: 'receipt', tone: 'red' })

      // Left: current loans
      c += card(0, 318, 696, 396)
      c += text(24, 350, 'Your current loans', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(24, 369, 'Return at the desk when you are finished.', { size: 11, fill: C.inkFaint })
      c += text(672, 350, 'View all', { size: 11.5, weight: 600, fill: C.forest700, anchor: 'end' })
      c += line(0, 384, 696, 384, { stroke: C.cream200 })

      const loans = [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          category: 'Fiction',
          due: 'Due Nov 9 · 4 days left',
          status: 'On loan',
          tone: 'success',
        },
        {
          title: 'Clean Code',
          author: 'Robert C. Martin',
          category: 'Technology',
          due: 'Due Nov 13 · 8 days left',
          status: 'On loan',
          tone: 'success',
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          category: 'Fiction',
          due: 'Due Oct 30 · 6 days overdue',
          status: 'Overdue',
          tone: 'danger',
        },
      ]
      loans.forEach((loan, index) => {
        const y = 400 + index * 96
        c += coverRow(loan.title, 24, y, 648, {
          author: loan.author,
          category: loan.category,
          due: loan.due,
          status: loan.status,
          tone: loan.tone,
        })
        c += icon('arrowright', 660, y + 24, 15, C.inkFaint)
        c += tableRowDivider(24, y + 78, 648)
      })

      c += button(24, 664, 'Request another book', { variant: 'secondary', iconName: 'plus', w: 190, h: 36, size: 12 })

      // Right: suggestions
      c += card(720, 318, 400, 396)
      c += text(744, 350, 'Fresh from the catalog', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(744, 369, 'Available copies picked for you.', { size: 11, fill: C.inkFaint })
      c += text(1096, 350, 'Browse all', { size: 11.5, weight: 600, fill: C.forest700, anchor: 'end' })
      c += line(720, 384, 1120, 384, { stroke: C.cream200 })

      const picks = [
        ['Atomic Habits', 'James Clear', 'Self-Help'],
        ['Sapiens', 'Yuval Noah Harari', 'History'],
        ['Deep Work', 'Cal Newport', 'Self-Help'],
      ]
      picks.forEach(([title, author, category], index) => {
        const y = 400 + index * 96
        c += bookCover(744, y, 42, { title, category, h: 58 })
        c += text(800, y + 16, title, { size: 12.5, weight: 600, fill: C.ink })
        c += text(800, y + 32, author, { size: 10, fill: C.inkFaint })
        c += text(800, y + 50, 'Available · 1 copy', { size: 9.5, fill: C.forest700 })
        c += text(1096, y + 20, 'Request', { size: 10.5, weight: 600, fill: C.forest700, anchor: 'end' })
        c += tableRowDivider(744, y + 78, 352)
      })

      c += rect(744, 650, 352, 44, { fill: C.cream50, stroke: C.cream200, rx: 10 })
      c += icon('info', 758, 664, 15, C.inkFaint)
      c += text(780, 680, 'Requests take a moment to review.', { size: 10.5, fill: C.inkMuted })

      return appShell({ role: 'student', active: 'Dashboard', content: c, user })
    },
  },
  {
    id: '08-catalog',
    group: 'Student',
    title: 'Browse catalog',
    note: 'Search, filters and availability-aware request buttons.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Library catalog',
        title: 'Find your next read',
        description: 'Search 24 physical copies across nine subject areas. Each row is one copy.',
        actions: [
          { label: '3 of 5 loans used', variant: 'secondary', w: 148 },
        ],
      })
      c += text(1120, 58, '2 pending requests', { size: 9.5, weight: 600, fill: C.brass700, anchor: 'end' })

      c += card(0, 92, 1120, 64, { rx: 14 })
      c += searchField(14, 104, 430, { placeholder: 'Search by title, author or ISBN…' })
      c += selectField(458, 104, 196, { value: 'All categories', h: 40 })
      c += selectField(666, 104, 170, { value: 'Available only', h: 40 })
      c += selectField(848, 104, 170, { value: 'Sort: Title A–Z', h: 40 })
      c += button(1032, 104, 'Filters', { variant: 'secondary', iconName: 'filter', w: 74, h: 40 })

      c += text(0, 192, '24 titles', { size: 13, weight: 600, fill: C.ink })
      c += text(76, 192, '· showing available and on-loan copies', { size: 11.5, fill: C.inkFaint })
      c += text(1120, 192, 'Grid view', { size: 11, weight: 600, fill: C.forest700, anchor: 'end' })

      const books = [
        ['The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'Borrowed', 'warning'],
        ['Atomic Habits', 'James Clear', 'Self-Help', 'Available', 'success'],
        ['Clean Code', 'Robert C. Martin', 'Technology', 'Borrowed', 'warning'],
        ['Sapiens', 'Yuval Noah Harari', 'History', 'Available', 'success'],
        ['To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'Available', 'success'],
        ['Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', 'Available', 'success'],
        ['The Republic', 'Plato', 'Philosophy', 'Damaged', 'danger'],
        ['Noli Me Tangere', 'José Rizal', 'Literature', 'Available', 'success'],
        ['Deep Work', 'Cal Newport', 'Self-Help', 'Available', 'success'],
      ]
      books.forEach(([title, author, category, status, tone], index) => {
        const x = (index % 3) * 380
        const y = 208 + Math.floor(index / 3) * 204
        const available = status === 'Available'
        c += card(x, y, 360, 188)
        c += bookCover(x + 14, y + 14, 96, { title, category, h: 136, author })
        c += text(x + 124, y + 30, category.toUpperCase(), {
          size: 8,
          weight: 700,
          fill: C.inkFaint,
          letter: 1.1,
        })
        c += badge(x + 346, y + 18, status, { tone, anchor: 'end' })
        c += wrap(x + 124, y + 54, title, 26, 17, { size: 14.5, weight: 600, fill: C.ink })
        c += text(x + 124, y + 94, author, { size: 10.5, fill: C.inkMuted })
        c += text(x + 124, y + 112, '1 physical copy · BK-0001' + (index + 1), { size: 9.5, fill: C.inkFaint })
        c += line(x + 14, y + 160, x + 346, y + 160, { stroke: C.cream200 })
        c += text(x + 14, y + 177, available ? 'Ready to request' : 'Currently on loan', {
          size: 9.5,
          fill: available ? C.forest700 : C.inkFaint,
        })
        c += button(x + 258, y + 150, available ? 'Request' : 'Details', {
          variant: available ? 'primary' : 'secondary',
          w: 88,
          h: 28,
          size: 11.5,
        })
      })

      c += text(545, 640, '1', { size: 11, weight: 700, fill: C.cream50, anchor: 'middle' })
      c += rect(534, 626, 22, 22, { fill: C.forest800, rx: 6 })
      c += text(564, 640, '2', { size: 11, fill: C.inkMuted })
      c += text(594, 640, '3', { size: 11, fill: C.inkMuted })
      c += text(1120, 640, 'Showing 1–9 of 24', { size: 10.5, fill: C.inkFaint, anchor: 'end' })

      c += rect(0, 670, 1120, 52, { fill: C.cream50, stroke: C.cream200, rx: 14 })
      c += icon('info', 18, 688, 16, C.inkFaint)
      c += wrap(44, 696, 'Requests are reviewed by a librarian. Once approved, the copy is marked Borrowed and the 14-day due date begins.', 128, 16, {
        size: 11,
        fill: C.inkMuted,
      })
      return appShell({ role: 'student', active: 'Browse catalog', content: c, user })
    },
  },
  {
    id: '09-book-detail',
    group: 'Student',
    title: 'Book detail',
    note: 'Single-copy detail with availability, rules and request action.',
    render() {
      let c = icon('arrowleft', 0, 0, 15, C.inkMuted)
      c += text(22, 12, 'Back to catalog', { size: 11.5, weight: 600, fill: C.forest700 })

      c += card(0, 40, 328, 444)
      c += bookCover(56, 76, 216, { title: 'Atomic Habits', category: 'Self-Help', h: 308, author: 'James Clear' })
      c += text(164, 418, 'BK-00023', { size: 10, weight: 600, fill: C.inkMuted, anchor: 'middle' })
      c += text(164, 438, 'Shelf F-04 · Self-Help', { size: 9.5, fill: C.inkFaint, anchor: 'middle' })
      c += text(164, 462, '1 physical copy', { size: 9.5, fill: C.inkFaint, anchor: 'middle' })

      c += text(360, 60, 'SELF-HELP', { size: 9.5, weight: 700, fill: C.brass700, letter: 1.5 })
      c += text(360, 100, 'Atomic Habits', { size: 36, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(360, 128, 'by James Clear', { size: 14, fill: C.inkMuted })
      c += badge(360, 146, 'Available', { tone: 'success' })
      c += badge(432, 146, '1 copy', { tone: 'neutral' })

      c += wrap(
        360,
        194,
        'A practical guide to building good habits and breaking bad ones. Small changes, repeated consistently, compound into remarkable results.',
        78,
        21,
        { size: 13, fill: C.inkSoft },
      )

      const meta = [
        ['Category', 'Self-Help'],
        ['Loan period', '14 days'],
        ['Shelf', 'F-04'],
        ['Fine rate', '₱5 / late day'],
      ]
      meta.forEach(([label, value], index) => {
        const x = 360 + index * 190
        c += rect(x, 262, 178, 64, { fill: C.cream50, stroke: C.cream200, rx: 10 })
        c += text(x + 12, 282, label.toUpperCase(), { size: 8, weight: 700, fill: C.inkFaint, letter: 1 })
        c += text(x + 12, 306, value, { size: 12.5, weight: 600, fill: C.ink })
      })

      c += rect(360, 348, 760, 74, { fill: C.forest50, stroke: C.forest200, rx: 12 })
      c += icon('checkcircle', 378, 366, 18, C.forest700)
      c += text(404, 374, 'You are eligible to request this copy', { size: 12.5, weight: 600, fill: C.forest900 })
      c += text(404, 394, 'No unpaid fines. You have 2 of 5 active loans and 1 pending request.', { size: 10.5, fill: C.forest800 })

      c += button(360, 440, 'Request this book', { iconName: 'bookopen', h: 46, w: 196 })
      c += text(572, 468, 'The 14-day loan starts when a librarian approves your request.', {
        size: 10.5,
        fill: C.inkFaint,
      })

      c += line(360, 510, 1120, 510, { stroke: C.cream200 })
      c += text(360, 536, 'About this copy', { size: 16, weight: 600, family: DISPLAY, fill: C.ink })
      c += wrap(
        360,
        558,
        'This catalog entry represents one physical copy. Returning it at the desk immediately makes it available to the next student. Lost or damaged copies are recorded by staff and may carry a fine.',
        108,
        17,
        { size: 11, fill: C.inkMuted },
      )

      c += text(0, 536, 'More in Self-Help', { size: 16, weight: 600, family: DISPLAY, fill: C.ink })
      const more = [
        ['Deep Work', 'Cal Newport', 'Self-Help', 'Available'],
        ['The Alchemist', 'Paulo Coelho', 'Fiction', 'Available'],
        ['Meditations', 'Marcus Aurelius', 'Philosophy', 'Available'],
      ]
      more.forEach(([title, author, category, status], index) => {
        const x = 0
        const y = 560 + index * 56
        c += bookCover(x, y, 36, { title, category, h: 46 })
        c += text(50, y + 14, title, { size: 11.5, weight: 600, fill: C.ink })
        c += text(50, y + 29, author, { size: 9.5, fill: C.inkFaint })
        c += badge(328, y + 8, status, { tone: 'success', anchor: 'end' })
      })
      return appShell({ role: 'student', active: 'Browse catalog', content: c, user })
    },
  },
  {
    id: '10-my-loans',
    group: 'Student',
    title: 'My loans',
    note: 'Pending requests sit above active and returned loan history.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'My loans',
        title: 'Borrowing history',
        description: 'Track requests waiting for approval, current due dates, and every loan you have returned.',
        actions: [{ label: 'Request another book', iconName: 'plus', w: 186 }],
      })

      c += statCard(0, 92, 268, { label: 'On loan', value: '2', hint: 'Both due this month', iconName: 'bookmark', tone: 'forest', h: 108 })
      c += statCard(284, 92, 268, { label: 'Pending requests', value: '2', hint: 'Waiting for the desk', iconName: 'inbox', tone: 'brass', h: 108 })
      c += statCard(568, 92, 268, { label: 'Overdue', value: '1', hint: '₱30 estimated fine', iconName: 'clock', tone: 'red', h: 108 })
      c += statCard(852, 92, 268, { label: 'Returned', value: '12', hint: 'All time', iconName: 'checkcircle', tone: 'cream', h: 108 })

      // Pending strip
      c += card(0, 218, 1120, 152)
      c += text(24, 248, 'Pending requests', { size: 18, weight: 600, family: DISPLAY, fill: C.ink })
      c += badge(1096, 234, '2 waiting', { tone: 'warning', anchor: 'end' })
      c += text(24, 266, 'These copies stay available until a librarian approves them.', { size: 10.5, fill: C.inkFaint })
      c += line(0, 282, 1120, 282, { stroke: C.cream200 })

      const pending = [
        ['Atomic Habits', 'James Clear', 'Self-Help', 'Requested Nov 4'],
        ['The Alchemist', 'Paulo Coelho', 'Fiction', 'Requested Nov 3'],
      ]
      pending.forEach(([title, author, category, requested], index) => {
        const x = 24 + index * 548
        c += bookCover(x, 298, 34, { title, category, h: 48 })
        c += text(x + 48, 312, title, { size: 12, weight: 600, fill: C.ink })
        c += text(x + 48, 328, `${author} · ${requested}`, { size: 9.5, fill: C.inkFaint })
        c += text(x + 48, 344, 'Awaiting approval · 14-day loan starts after', { size: 9, fill: C.brass700 })
        c += text(x + 520, 316, 'Cancel', { size: 10.5, weight: 600, fill: C.red600, anchor: 'end' })
      })

      // Table
      c += card(0, 386, 1120, 336)
      c += line(0, 430, 1120, 430, { stroke: C.cream300 })
      c += tabs(24, 414, [
        { label: 'All', count: 14 },
        { label: 'On loan', count: 2 },
        { label: 'Overdue', count: 1 },
        { label: 'Returned', count: 11 },
      ], { active: 0, gap: 34 })
      c += line(0, 430, 1120, 430, { stroke: C.cream300 })

      c += text(24, 458, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(548, 458, 'BORROWED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(686, 458, 'DUE', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(838, 458, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1010, 458, 'FINE', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })

      const rows = [
        ['Atomic Habits', 'James Clear', 'Self-Help', 'Nov 5, 2026', 'Nov 19, 2026', 'On loan', 'success', '—'],
        ['The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'Nov 1, 2026', 'Nov 15, 2026', 'On loan', 'success', '—'],
        ['To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'Oct 18, 2026', 'Nov 1, 2026', 'Overdue 4d', 'danger', '₱20 est.'],
        ['Sapiens', 'Yuval Noah Harari', 'History', 'Sep 28, 2026', 'Oct 12, 2026', 'Returned', 'neutral', '—'],
      ]
      rows.forEach((row, index) => {
        const y = 476 + index * 60
        c += bookCover(24, y + 4, 30, { title: row[0], category: row[2], h: 42 })
        c += text(66, y + 18, row[0], { size: 12, weight: 600, fill: C.ink })
        c += text(66, y + 33, row[1], { size: 9.5, fill: C.inkFaint })
        c += text(548, y + 25, row[3], { size: 10.5, fill: C.inkMuted })
        c += text(686, y + 25, row[4], { size: 10.5, fill: row[6] === 'danger' ? C.red600 : C.inkMuted })
        c += badge(838, y + 12, row[5], { tone: row[6] })
        c += text(1010, y + 25, row[7], { size: 10.5, fill: row[7].startsWith('₱') ? C.red600 : C.inkFaint })
        if (index < rows.length - 1) c += tableRowDivider(24, y + 52, 1072)
      })

      return appShell({ role: 'student', active: 'My loans', content: c, user })
    },
  },
  {
    id: '11-my-fines',
    group: 'Student',
    title: 'My fines',
    note: 'Outstanding balance, simulated payment and fine history.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'My fines',
        title: 'Fines & payments',
        description: 'Settle overdue charges to keep requesting books. Fines are finalised when a loan is returned.',
        actions: [{ label: 'Borrowing rules', variant: 'secondary', w: 146 }],
      })

      c += statCard(0, 92, 360, { label: 'Outstanding balance', value: '₱25', hint: 'Blocks new borrow requests', iconName: 'receipt', tone: 'red' })
      c += statCard(380, 92, 360, { label: 'Paid this term', value: '₱15', hint: '2 payments recorded', iconName: 'checkcircle', tone: 'forest' })
      c += statCard(760, 92, 360, { label: 'Waived', value: '₱5', hint: '1 charge waived by staff', iconName: 'handcoins', tone: 'brass' })

      c += rect(0, 234, 1120, 62, { fill: C.brass50, stroke: C.brass200, rx: 14 })
      c += icon('alert', 20, 250, 20, C.brass700)
      c += text(50, 258, 'You have ₱25 in unpaid fines', { size: 13, weight: 600, fill: C.brass900 })
      c += text(50, 276, 'Pay or have the charge waived at the desk before requesting another book.', { size: 10.5, fill: C.brass800 })
      c += button(966, 247, 'Pay ₱25 now', { h: 34, w: 130, size: 12 })

      c += card(0, 312, 1120, 372)
      c += tabs(24, 340, [
        { label: 'All', count: 3 },
        { label: 'Unpaid', count: 1 },
        { label: 'Paid', count: 1 },
        { label: 'Waived', count: 1 },
      ], { active: 0, gap: 32 })
      c += line(0, 356, 1120, 356, { stroke: C.cream300 })

      c += text(24, 384, 'REASON', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(300, 384, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(660, 384, 'ISSUED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(820, 384, 'AMOUNT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(954, 384, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })

      const fines = [
        ['Overdue · 5 days', 'To Kill a Mockingbird', 'Nov 1, 2026', '₱25.00', 'Unpaid', 'warning'],
        ['Overdue · 3 days', 'Sapiens', 'Oct 15, 2026', '₱15.00', 'Paid', 'success'],
        ['Damaged cover', 'The Republic', 'Sep 22, 2026', '₱5.00', 'Waived', 'neutral'],
      ]
      fines.forEach((row, index) => {
        const y = 402 + index * 76
        c += circle(33, y + 18, 14, {
          fill: row[4] === 'Unpaid' ? C.red50 : row[4] === 'Paid' ? C.forest50 : C.cream100,
        })
        c += icon(row[4] === 'Paid' ? 'check' : row[4] === 'Waived' ? 'handcoins' : 'clock', 25, y + 10, 16,
          row[4] === 'Unpaid' ? C.red600 : row[4] === 'Paid' ? C.forest700 : C.inkMuted)
        c += text(60, y + 16, row[0], { size: 11.5, weight: 600, fill: C.ink })
        c += text(60, y + 32, 'Fine #' + (1040 + index), { size: 9.5, fill: C.inkFaint })
        c += text(300, y + 23, row[1], { size: 10.5, fill: C.inkMuted })
        c += text(660, y + 23, row[2], { size: 10.5, fill: C.inkMuted })
        c += text(820, y + 23, row[3], { size: 11.5, weight: 600, fill: C.ink })
        c += badge(954, y + 11, row[4], { tone: row[5] })
        if (row[4] === 'Unpaid') c += text(1096, y + 23, 'Pay', { size: 10.5, weight: 600, fill: C.forest700, anchor: 'end' })
        if (index < fines.length - 1) c += tableRowDivider(24, y + 60, 1072)
      })

      c += rect(0, 704, 1120, 46, { fill: C.cream50, stroke: C.cream200, rx: 12 })
      c += icon('info', 16, 720, 15, C.inkFaint)
      c += text(40, 731, 'Payments are simulated in this demo. In production, the desk records cash or online payments.', {
        size: 10.5,
        fill: C.inkMuted,
      })
      return appShell({ role: 'student', active: 'My fines', content: c, user })
    },
  },
  {
    id: '12-profile',
    group: 'Student',
    title: 'Profile & settings',
    note: 'Editable details, password entry point and demo data reset.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Account',
        title: 'Profile & settings',
        description: 'Keep your contact details current and manage how you sign in.',
      })

      c += card(0, 92, 340, 556)
      c += circle(170, 168, 44, { fill: C.forest100 })
      c += text(170, 181, 'JD', { size: 28, weight: 700, fill: C.forest800, anchor: 'middle' })
      c += text(170, 242, 'Juan Dela Cruz', { size: 20, weight: 600, family: DISPLAY, fill: C.ink, anchor: 'middle' })
      c += text(170, 262, 'juan.delacruz@gmail.com', { size: 11, fill: C.inkMuted, anchor: 'middle' })
      c += badge(170, 278, 'Student', { tone: 'success', anchor: 'center' })
      c += text(170, 320, 'Member since January 2026', { size: 10, fill: C.inkFaint, anchor: 'middle' })

      c += line(24, 344, 316, 344, { stroke: C.cream200 })
      const stats = [
        ['2', 'Active loans'],
        ['12', 'Books read'],
        ['₱25', 'Unpaid fines'],
      ]
      stats.forEach(([value, label], index) => {
        const x = 56 + index * 100
        c += text(x, 380, value, { size: 20, weight: 600, family: DISPLAY, fill: C.ink, anchor: 'middle' })
        c += text(x, 398, label, { size: 9, fill: C.inkFaint, anchor: 'middle' })
      })

      c += line(24, 424, 316, 424, { stroke: C.cream200 })
      c += text(24, 454, 'DEMO DATA', { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1.2 })
      c += wrap(24, 476, 'Reset every book, loan and fine back to the seeded demo state.', 44, 16, {
        size: 10.5,
        fill: C.inkMuted,
      })
      c += button(24, 526, 'Reset demo data', { variant: 'secondary', iconName: 'rotate', w: 292, h: 38, size: 12 })
      c += text(24, 592, 'Your account stays signed in.', { size: 9.5, fill: C.inkFaint })

      // Right card
      c += card(364, 92, 756, 556)
      c += text(392, 128, 'Personal details', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(392, 147, 'Shown to library staff when you borrow or return a copy.', { size: 10.5, fill: C.inkFaint })
      c += line(364, 168, 1120, 168, { stroke: C.cream200 })

      c += textField(392, 194, 338, { label: 'First name', value: 'Juan' })
      c += textField(752, 194, 340, { label: 'Last name', value: 'Dela Cruz' })
      c += textField(392, 274, 338, { label: 'Contact number', value: '0917 123 4567' })
      c += textField(752, 274, 340, { label: 'Student number', value: '2026-00184', hint: 'Managed by the registrar.' })
      c += textField(392, 354, 700, { label: 'Email address', value: 'juan.delacruz@gmail.com', hint: 'Gmail address used for verification and notifications.' })
      c += button(966, 414, 'Save changes', { w: 126, h: 38, size: 12 })

      c += line(364, 466, 1120, 466, { stroke: C.cream200 })
      c += text(392, 500, 'Password & security', { size: 18, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(392, 520, 'Last changed on October 12, 2026.', { size: 10.5, fill: C.inkFaint })
      c += rect(392, 540, 700, 64, { fill: C.cream50, stroke: C.cream200, rx: 12 })
      c += icon('lock', 410, 560, 18, C.inkMuted)
      c += text(440, 566, 'Password', { size: 11.5, weight: 600, fill: C.ink })
      c += text(440, 584, '••••••••••', { size: 11, fill: C.inkFaint, letter: 2 })
      c += button(956, 554, 'Change password', { variant: 'secondary', w: 120, h: 34, size: 11.5 })

      c += text(392, 626, 'Signed in on this device only.', { size: 9.5, fill: C.inkFaint })
      return appShell({ role: 'student', active: 'Profile & settings', content: c, user })
    },
  },
]
