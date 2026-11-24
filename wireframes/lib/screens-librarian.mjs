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
  bookCover,
  appShell,
  textField,
  tableRowDivider,
} from './kit.mjs'

const user = { name: 'Maria Lopez', label: 'Librarian' }

function miniStat(x, y, w, { label, value, iconName, tone = 'forest', hint }) {
  const tones = {
    forest: [C.forest50, C.forest700],
    brass: [C.brass50, C.brass700],
    red: [C.red50, C.red600],
    cream: [C.cream100, C.inkSoft],
  }
  const [bg, fg] = tones[tone] || tones.forest
  let out = card(x, y, w, 92, { rx: 14 })
  out += rect(x + 16, y + 22, 38, 38, { fill: bg, rx: 10 })
  out += icon(iconName, x + 26, y + 32, 18, fg)
  out += text(x + 66, y + 38, label.toUpperCase(), { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1 })
  out += text(x + 66, y + 64, value, { size: 24, weight: 600, family: DISPLAY, fill: C.ink })
  if (hint) out += text(x + 66, y + 80, hint, { size: 9, fill: C.inkFaint })
  return out
}

export const librarianScreens = [
  {
    id: '13-librarian-dashboard',
    group: 'Librarian',
    title: 'Librarian dashboard',
    note: 'Overdue shelf on the left, four operation shortcuts stacked on the right.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Circulation desk',
        title: 'Good afternoon, Maria',
        description: 'Two requests are waiting, and the overdue shelf needs a nudge.',
        actions: [{ label: 'Issue a loan', iconName: 'calendar', w: 138 }],
      })

      c += statCard(0, 92, 268, { label: 'Active loans', value: '8', hint: '2 requests pending', iconName: 'bookopen', tone: 'forest' })
      c += statCard(284, 92, 268, { label: 'Pending requests', value: '2', hint: 'Oldest waiting 2 days', iconName: 'inbox', tone: 'brass' })
      c += statCard(568, 92, 268, { label: 'Overdue', value: '2', hint: '₱40 estimated fines', iconName: 'clock', tone: 'red' })
      c += statCard(852, 92, 268, { label: 'Unpaid fines', value: '₱85', hint: 'Across 4 students', iconName: 'receipt', tone: 'cream' })

      // Overdue shelf
      c += card(0, 234, 640, 474)
      c += text(24, 268, 'Overdue shelf', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(24, 288, 'Items past their due date, oldest first.', { size: 10.5, fill: C.inkFaint })
      c += badge(616, 254, '2 overdue', { tone: 'danger', anchor: 'end' })
      c += line(0, 304, 640, 304, { stroke: C.cream200 })

      const overdue = [
        ['To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'Maria Santos', '6 days late', '₱30'],
        ['History of the Filipino People', 'Teodoro A. Agoncillo', 'History', 'Miguel Torres', '2 days late', '₱10'],
      ]
      overdue.forEach(([title, author, category, student, late, fine], index) => {
        const y = 320 + index * 106
        c += bookCover(24, y, 42, { title, category, h: 58 })
        c += text(80, y + 16, title, { size: 12.5, weight: 600, fill: C.ink })
        c += text(80, y + 32, author, { size: 10, fill: C.inkFaint })
        c += avatar(80, y + 42, 18, { initials: student.split(' ').map((p) => p[0]).join(''), role: 'student' })
        c += text(104, y + 55, student, { size: 9.5, fill: C.inkMuted })
        c += badge(460, y + 14, late, { tone: 'danger', anchor: 'end' })
        c += text(616, y + 18, fine, { size: 12, weight: 600, fill: C.red600, anchor: 'end' })
        c += text(616, y + 32, 'estimated', { size: 8.5, fill: C.inkFaint, anchor: 'end' })
        c += text(616, y + 50, 'Return', { size: 10.5, weight: 600, fill: C.forest700, anchor: 'end' })
        if (index < overdue.length - 1) c += tableRowDivider(24, y + 88, 592)
      })

      c += rect(24, 536, 592, 76, { fill: C.cream50, stroke: C.cream200, rx: 12 })
      c += icon('calendar', 40, 554, 18, C.inkMuted)
      c += text(66, 562, '3 returns expected today', { size: 11.5, weight: 600, fill: C.ink })
      c += text(66, 580, 'The Great Gatsby · Clean Code · Sapiens', { size: 9.5, fill: C.inkFaint })
      c += text(66, 596, 'Send a courtesy reminder from the student record.', { size: 9, fill: C.inkMuted })

      c += text(24, 650, 'Open circulation', { size: 11, weight: 600, fill: C.forest700 })
      c += icon('arrowright', 128, 639, 14, C.forest700)
      c += text(616, 650, 'Updated just now', { size: 9.5, fill: C.inkFaint, anchor: 'end' })

      // Shortcuts
      const shortcuts = [
        ['inbox', 'Review borrow requests', '2 requests are waiting for a decision.', C.brass50, C.brass700, '3 min'],
        ['library', 'Maintain the catalog', '12 copies ready to lend today.', C.forest50, C.forest700, '24 titles'],
        ['users', 'Look up a student', 'Check loans, fines and contact details.', C.cream100, C.inkSoft, '8 students'],
        ['dollar', 'Collect or waive fines', '₱85 outstanding across the desk.', C.red50, C.red600, '4 unpaid'],
      ]
      shortcuts.forEach(([iconName, title, body, bg, fg, meta], index) => {
        const y = 234 + index * 121
        c += card(664, y, 456, 112, { rx: 14 })
        c += rect(682, y + 20, 40, 40, { fill: bg, rx: 11 })
        c += icon(iconName, 693, y + 31, 18, fg)
        c += text(738, y + 38, title, { size: 14, weight: 600, fill: C.ink })
        c += wrap(738, y + 57, body, 44, 15, { size: 10.5, fill: C.inkMuted })
        c += text(1096, y + 34, meta, { size: 9, weight: 600, fill: C.inkFaint, anchor: 'end' })
        c += icon('arrowright', 1084, y + 72, 15, C.inkFaint)
      })

      return appShell({ role: 'librarian', active: 'Dashboard', content: c, user })
    },
  },
  {
    id: '14-borrow-requests',
    group: 'Librarian',
    title: 'Borrow requests',
    note: 'Approve or decline student requests; the copy changes status only on approval.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Circulation',
        title: 'Borrow requests',
        description: 'Review what students have asked to borrow. A copy is only marked Borrowed after approval.',
        actions: [{ label: 'Issue a loan', variant: 'secondary', iconName: 'calendar', w: 138 }],
      })

      c += miniStat(0, 92, 268, { label: 'Pending requests', value: '2', iconName: 'inbox', tone: 'brass', hint: 'Oldest 2 days' })
      c += miniStat(284, 92, 268, { label: 'Students waiting', value: '2', iconName: 'users', tone: 'forest', hint: 'Across 2 titles' })
      c += miniStat(568, 92, 268, { label: 'Available copies', value: '12', iconName: 'library', tone: 'forest', hint: 'Ready to issue' })
      c += miniStat(852, 92, 268, { label: 'Reviewed', value: '6', iconName: 'checkcircle', tone: 'cream', hint: 'This month' })

      c += card(0, 200, 1120, 390)
      c += line(0, 250, 1120, 250, { stroke: C.cream300 })
      c += tabs(24, 234, [
        { label: 'Pending', count: 2 },
        { label: 'Reviewed', count: 6 },
      ], { active: 0, gap: 28 })
      c += searchField(760, 214, 338, { placeholder: 'Search by student or book…', h: 36 })
      c += line(0, 250, 1120, 250, { stroke: C.cream300 })

      c += text(24, 280, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(400, 280, 'STUDENT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(676, 280, 'REQUESTED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(816, 280, 'COPY', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(946, 280, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })

      const rows = [
        ['Atomic Habits', 'James Clear', 'Self-Help', 'Jose Ramirez', 'jose.ramirez@gmail.com', 'Nov 4, 2026', 'Pending', 'Available', 'success'],
        ['The Alchemist', 'Paulo Coelho', 'Fiction', 'Carlo Reyes', 'carlo.reyes@gmail.com', 'Nov 3, 2026', 'Pending', 'Available', 'success'],
      ]
      rows.forEach((row, index) => {
        const y = 296 + index * 84
        c += bookCover(24, y + 8, 36, { title: row[0], category: row[2], h: 50 })
        c += text(72, y + 24, row[0], { size: 12.5, weight: 600, fill: C.ink })
        c += text(72, y + 40, row[1], { size: 9.5, fill: C.inkFaint })
        c += text(72, y + 57, 'BK-000' + (index + 1), { size: 8.5, fill: C.inkFaint })
        c += avatar(400, y + 20, 28, { initials: row[3].split(' ').map((p) => p[0]).join(''), role: 'student' })
        c += text(438, y + 28, row[3], { size: 11, weight: 600, fill: C.inkSoft })
        c += text(438, y + 44, row[4], { size: 9, fill: C.inkFaint })
        c += text(676, y + 34, row[5], { size: 10.5, fill: C.inkMuted })
        c += badge(816, y + 22, row[7], { tone: row[8] })
        c += badge(946, y + 22, row[6], { tone: 'warning' })
        c += button(986, y + 18, 'Decline', { variant: 'secondary', w: 62, h: 28, size: 10 })
        c += button(1054, y + 18, 'Approve', { w: 66, h: 28, size: 10, iconName: 'check' })
        if (index < rows.length - 1) c += tableRowDivider(24, y + 74, 1072)
      })

      c += line(0, 476, 1120, 476, { stroke: C.cream200 })
      c += rect(24, 490, 1072, 44, { fill: C.forest50, stroke: C.forest200, rx: 10 })
      c += icon('checkcircle', 38, 504, 15, C.forest700)
      c += text(62, 516, 'The 14-day loan starts at approval. If two students request the same copy, approving one declines the other automatically.', {
        size: 10.5,
        fill: C.forest800,
      })
      c += text(24, 558, 'Pending requests', { size: 11, weight: 600, fill: C.inkFaint })
      c += text(24, 574, 'A request does not reserve the copy.', { size: 9.5, fill: C.inkFaint })

      // Process strip
      const steps = [
        ['01', 'Student requests', 'The student picks an available copy online.'],
        ['02', 'Desk reviews', 'Approve to issue, or decline to keep it free.'],
        ['03', 'Copy turns Borrowed', 'The loan clock and due date begin immediately.'],
      ]
      steps.forEach(([number, title, body], index) => {
        const x = index * 380
        c += rect(x, 610, 360, 104, { fill: C.white, stroke: C.cream300, rx: 14 })
        c += circle(x + 28, 640, 13, { fill: C.forest50 })
        c += text(x + 28, 644, number, { size: 8.5, weight: 700, fill: C.forest700, anchor: 'middle' })
        c += text(x + 52, 645, title, { size: 12, weight: 600, fill: C.ink })
        c += wrap(x + 20, 676, body, 42, 15, { size: 9.5, fill: C.inkMuted })
      })

      return appShell({ role: 'librarian', active: 'Borrow requests', content: c, user })
    },
  },
  {
    id: '15-manage-books',
    group: 'Librarian',
    title: 'Manage books',
    note: 'One row per physical copy, with loan state and safe delete rules.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Catalog',
        title: 'Manage books',
        description: 'Each row is one physical copy. Copies on loan cannot be deleted or marked unavailable until returned.',
        actions: [{ label: 'Add a book', iconName: 'plus', w: 130 }],
      })

      c += miniStat(0, 92, 268, { label: 'Total copies', value: '24', iconName: 'library', tone: 'forest', hint: 'Across 9 categories' })
      c += miniStat(284, 92, 268, { label: 'Available', value: '12', iconName: 'checkcircle', tone: 'forest', hint: 'Ready to request' })
      c += miniStat(568, 92, 268, { label: 'On loan', value: '10', iconName: 'bookopen', tone: 'brass', hint: '2 overdue' })
      c += miniStat(852, 92, 268, { label: 'Off the shelf', value: '2', iconName: 'alert', tone: 'red', hint: '1 damaged · 1 lost' })

      c += card(0, 200, 1120, 58, { rx: 14 })
      c += searchField(14, 210, 430, { placeholder: 'Search by title, author or book ID…', h: 38 })
      c += selectField(458, 210, 180, { value: 'All categories', h: 38 })
      c += selectField(650, 210, 160, { value: 'All statuses', h: 38 })
      c += selectField(822, 210, 160, { value: 'Sort: Title A–Z', h: 38 })
      c += text(1106, 233, '24 copies', { size: 10.5, weight: 600, fill: C.inkFaint, anchor: 'end' })

      c += card(0, 272, 1120, 438)
      c += rect(0, 272, 1120, 44, { fill: C.cream50, rx: 16 })
      c += rect(0, 300, 1120, 16, { fill: C.cream50 })
      c += text(24, 299, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(560, 299, 'CATEGORY', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(692, 299, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(824, 299, 'CURRENT LOAN', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1096, 299, 'ACTIONS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1, anchor: 'end' })
      c += line(0, 316, 1120, 316, { stroke: C.cream300 })

      const books = [
        ['The Great Gatsby', 'F. Scott Fitzgerald', 'BK-00001', 'Fiction', 'Borrowed', 'warning', 'Juan Dela Cruz · due Nov 9'],
        ['Atomic Habits', 'James Clear', 'BK-00023', 'Self-Help', 'Borrowed', 'warning', 'Juan Dela Cruz · due Nov 19'],
        ['Clean Code', 'Robert C. Martin', 'BK-00009', 'Technology', 'Borrowed', 'warning', 'Juan Dela Cruz · due Nov 13'],
        ['Sapiens', 'Yuval Noah Harari', 'BK-00005', 'History', 'Available', 'success', '—'],
        ['The Republic', 'Plato', 'BK-00017', 'Philosophy', 'Damaged', 'danger', '—'],
        ['Noli Me Tangere', 'José Rizal', 'BK-00020', 'Literature', 'Available', 'success', '—'],
      ]
      books.forEach((row, index) => {
        const y = 328 + index * 62
        c += bookCover(24, y + 4, 30, { title: row[0], category: row[3], h: 42 })
        c += text(66, y + 18, row[0], { size: 12, weight: 600, fill: C.ink })
        c += text(66, y + 34, `${row[1]} · ${row[2]}`, { size: 9, fill: C.inkFaint })
        c += text(560, y + 26, row[3], { size: 10.5, fill: C.inkMuted })
        c += badge(692, y + 14, row[4], { tone: row[5] })
        c += text(824, y + 22, row[6], { size: 10, fill: row[6] === '—' ? C.inkFaint : C.inkMuted })
        if (row[6] !== '—') c += text(824, y + 37, 'Issued by Maria Lopez', { size: 8.5, fill: C.inkFaint })
        c += icon('pencil', 1014, y + 16, 15, C.inkMuted)
        c += icon('trash', 1064, y + 16, 15, C.inkFaint)
        if (index < books.length - 1) c += tableRowDivider(24, y + 54, 1072)
      })

      c += line(0, 710, 1120, 710, { stroke: C.cream200 })
      c += text(24, 736, 'Showing 6 of 24 copies', { size: 10.5, fill: C.inkFaint })
      c += text(1096, 736, 'On-loan copies are locked until the return is processed.', { size: 9.5, fill: C.inkFaint, anchor: 'end' })

      return appShell({ role: 'librarian', active: 'Books', content: c, user })
    },
  },
  {
    id: '16-borrow-return',
    group: 'Librarian',
    title: 'Borrow & return',
    note: 'Desk-issued loans and returns with overdue estimates.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Circulation',
        title: 'Borrow & return',
        description: 'Approve student requests, issue a loan at the desk, or close one when the copy comes back.',
        actions: [
          { label: 'Borrow requests', variant: 'secondary', iconName: 'inbox', w: 158 },
          { label: 'Issue a loan', iconName: 'calendar', w: 128 },
        ],
      })

      c += miniStat(0, 92, 268, { label: 'Active loans', value: '8', iconName: 'bookopen', tone: 'forest', hint: '3 due this week' })
      c += miniStat(284, 92, 268, { label: 'Overdue', value: '2', iconName: 'clock', tone: 'red', hint: 'Return to create fines' })
      c += miniStat(568, 92, 268, { label: 'Returned', value: '12', iconName: 'checkcircle', tone: 'cream', hint: 'This month' })
      c += miniStat(852, 92, 268, { label: 'Pending requests', value: '2', iconName: 'inbox', tone: 'brass', hint: 'Review before issuing' })

      c += card(0, 200, 1120, 58, { rx: 14 })
      c += tabs(18, 234, [
        { label: 'All loans', count: 20 },
        { label: 'On loan', count: 8 },
        { label: 'Overdue', count: 2 },
        { label: 'Returned', count: 12 },
      ], { active: 0, gap: 26 })
      c += searchField(770, 210, 328, { placeholder: 'Search student or book…', h: 38 })

      c += card(0, 272, 1120, 438)
      c += text(24, 299, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(410, 299, 'STUDENT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(650, 299, 'ISSUED BY', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(790, 299, 'BORROWED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(900, 299, 'DUE', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1000, 299, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += line(0, 316, 1120, 316, { stroke: C.cream300 })

      const rows = [
        ['The Great Gatsby', 'Fiction', 'Juan Dela Cruz', 'Maria Lopez', 'Nov 1', 'Nov 15', 'On loan', 'success'],
        ['Clean Code', 'Technology', 'Juan Dela Cruz', 'Daniel Cruz', 'Oct 30', 'Nov 13', 'On loan', 'success'],
        ['1984', 'Fiction', 'Maria Santos', 'Maria Lopez', 'Oct 20', 'Nov 3', 'Overdue 2d', 'danger'],
        ['Sapiens', 'History', 'Jose Ramirez', 'Self-service', 'Oct 12', 'Oct 26', 'Returned', 'neutral'],
        ['Deep Work', 'Self-Help', 'Sofia Mendoza', 'Daniel Cruz', 'Oct 8', 'Oct 22', 'Returned', 'neutral'],
        ['Atomic Habits', 'Self-Help', 'Juan Dela Cruz', 'Maria Lopez', 'Nov 5', 'Nov 19', 'On loan', 'success'],
      ]
      rows.forEach((row, index) => {
        const y = 328 + index * 64
        c += bookCover(24, y + 6, 30, { title: row[0], category: row[1], h: 44 })
        c += text(66, y + 20, row[0], { size: 11.5, weight: 600, fill: C.ink })
        c += text(66, y + 36, row[1], { size: 9, fill: C.inkFaint })
        c += text(410, y + 27, row[2], { size: 10.5, fill: C.inkMuted })
        c += text(650, y + 27, row[3], { size: 9.5, fill: C.inkMuted })
        c += text(790, y + 27, row[4], { size: 10, fill: C.inkMuted })
        c += text(900, y + 27, row[5], { size: 10, fill: row[6].startsWith('Overdue') ? C.red600 : C.inkMuted })
        c += badge(1000, y + 16, row[6], { tone: row[7] })
        if (row[6] === 'On loan' || row[6].startsWith('Overdue')) {
          c += button(1052, y + 12, 'Return', { variant: 'secondary', w: 68, h: 28, size: 10 })
        }
        if (index < rows.length - 1) c += tableRowDivider(24, y + 56, 1072)
      })

      c += line(0, 710, 1120, 710, { stroke: C.cream200 })
      c += text(24, 736, 'Fines are finalised only when you process the return.', { size: 10, fill: C.inkFaint })
      c += text(1096, 736, '₱5 per late day', { size: 10, weight: 600, fill: C.inkMuted, anchor: 'end' })

      return appShell({ role: 'librarian', active: 'Borrow & return', content: c, user })
    },
  },
  {
    id: '17-students',
    group: 'Librarian',
    title: 'Students',
    note: 'Directory of borrowers with loan usage and unpaid balances.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Readers',
        title: 'Students',
        description: 'Look up a borrower, review their history, or check why a request is blocked.',
        actions: [{ label: 'Export list', variant: 'secondary', w: 124 }],
      })

      c += miniStat(0, 92, 364, { label: 'Registered students', value: '8', iconName: 'users', tone: 'forest', hint: 'All email-verified' })
      c += miniStat(378, 92, 364, { label: 'Active borrowers', value: '6', iconName: 'bookopen', tone: 'brass', hint: 'Holding at least one copy' })
      c += miniStat(756, 92, 364, { label: 'Outstanding fines', value: '₱85', iconName: 'receipt', tone: 'red', hint: 'Across 4 students' })

      c += card(0, 200, 1120, 516)
      c += text(24, 232, 'Student directory', { size: 18, weight: 600, family: DISPLAY, fill: C.ink })
      c += searchField(744, 210, 352, { placeholder: 'Search name, email or number…', h: 38 })
      c += line(0, 258, 1120, 258, { stroke: C.cream300 })

      c += text(24, 286, 'STUDENT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(452, 286, 'CONTACT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(650, 286, 'ACTIVE LOANS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(800, 286, 'UNPAID FINES', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(940, 286, 'TOTAL BORROWS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1096, 286, 'ACTION', { size: 9, weight: 700, fill: C.inkFaint, letter: 1, anchor: 'end' })

      const students = [
        ['Juan Dela Cruz', 'juan.delacruz@gmail.com', '0917 123 4567', '3 / 5', '₱25', '14'],
        ['Maria Santos', 'maria.santos@gmail.com', '0918 234 5678', '1 / 5', '₱0', '9'],
        ['Jose Ramirez', 'jose.ramirez@gmail.com', '0919 345 6789', '1 / 5', '₱0', '7'],
        ['Ana Villanueva', 'ana.villanueva@gmail.com', '0920 456 7890', '1 / 5', '₱10', '6'],
        ['Miguel Torres', 'miguel.torres@gmail.com', '0921 567 8901', '4 / 5', '₱15', '11'],
        ['Sofia Mendoza', 'sofia.mendoza@gmail.com', '0922 678 9012', '1 / 5', '₱0', '8'],
      ]
      students.forEach((row, index) => {
        const y = 302 + index * 67
        c += avatar(24, y + 10, 34, { initials: row[0].split(' ').map((p) => p[0]).join(''), role: 'student' })
        c += text(70, y + 24, row[0], { size: 11.5, weight: 600, fill: C.ink })
        c += text(70, y + 40, row[1], { size: 9, fill: C.inkFaint })
        c += text(452, y + 32, row[2], { size: 9.5, fill: C.inkMuted })
        c += text(650, y + 32, row[3], { size: 10.5, weight: 600, fill: row[3].startsWith('5') || row[3].startsWith('4') ? C.brass700 : C.ink })
        c += text(800, y + 32, row[4], { size: 10.5, fill: row[4] === '₱0' ? C.inkFaint : C.red600 })
        c += text(940, y + 32, row[5], { size: 10.5, fill: C.inkMuted })
        c += text(1096, y + 32, 'View profile', { size: 10, weight: 600, fill: C.forest700, anchor: 'end' })
        if (index < students.length - 1) c += tableRowDivider(24, y + 56, 1072)
      })

      c += line(0, 710, 1120, 710, { stroke: C.cream200 })
      c += text(24, 736, '8 students · 12 active loans · 2 requests waiting', { size: 10, fill: C.inkFaint })
      c += text(1096, 736, 'A student at 5 loans cannot request another copy.', { size: 9.5, fill: C.inkFaint, anchor: 'end' })

      return appShell({ role: 'librarian', active: 'Students', content: c, user })
    },
  },
  {
    id: '18-fines',
    group: 'Librarian',
    title: 'Fines & payments',
    note: 'Collect, waive or issue a fine; overdue charges are created on return.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Fines',
        title: 'Fines & payments',
        description: 'Collect or waive charges, or record a manual fine for a damaged or lost copy.',
        actions: [{ label: 'Issue a fine', iconName: 'plus', w: 132 }],
      })

      c += statCard(0, 92, 360, { label: 'Outstanding', value: '₱85', hint: '4 unpaid charges · 3 students', iconName: 'receipt', tone: 'red' })
      c += statCard(380, 92, 360, { label: 'Collected this month', value: '₱45', hint: '6 payments recorded', iconName: 'checkcircle', tone: 'forest' })
      c += statCard(760, 92, 360, { label: 'Waived', value: '₱10', hint: '2 charges waived by staff', iconName: 'handcoins', tone: 'brass' })

      c += card(0, 232, 1120, 484)
      c += tabs(24, 264, [
        { label: 'All', count: 10 },
        { label: 'Unpaid', count: 4 },
        { label: 'Paid', count: 4 },
        { label: 'Waived', count: 2 },
      ], { active: 0, gap: 30 })
      c += selectField(690, 244, 160, { value: 'All reasons', h: 34 })
      c += searchField(862, 244, 234, { placeholder: 'Search student or book…', h: 34 })
      c += line(0, 286, 1120, 286, { stroke: C.cream300 })

      c += text(24, 314, 'STUDENT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(292, 314, 'REASON', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(528, 314, 'BOOK', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(792, 314, 'ISSUED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(914, 314, 'AMOUNT', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1022, 314, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })

      const fines = [
        ['Juan Dela Cruz', 'juan.delacruz@gmail.com', 'Overdue · 5 days', 'To Kill a Mockingbird', 'Nov 1', '₱25.00', 'Unpaid', 'warning'],
        ['Miguel Torres', 'miguel.torres@gmail.com', 'Overdue · 2 days', 'History of the Filipino People', 'Nov 3', '₱10.00', 'Unpaid', 'warning'],
        ['Bea Aquino', 'bea.aquino@gmail.com', 'Damaged cover', 'The Republic', 'Oct 28', '₱30.00', 'Unpaid', 'warning'],
        ['Ana Villanueva', 'ana.villanueva@gmail.com', 'Overdue · 2 days', 'The Selfish Gene', 'Oct 22', '₱20.00', 'Unpaid', 'warning'],
        ['Maria Santos', 'maria.santos@gmail.com', 'Overdue · 3 days', 'Sapiens', 'Oct 15', '₱15.00', 'Paid', 'success'],
        ['Sofia Mendoza', 'sofia.mendoza@gmail.com', 'Lost copy', 'The Odyssey', 'Oct 10', '₱10.00', 'Waived', 'neutral'],
      ]
      fines.forEach((row, index) => {
        const y = 330 + index * 60
        c += avatar(24, y + 8, 28, { initials: row[0].split(' ').map((p) => p[0]).join(''), role: 'student' })
        c += text(62, y + 20, row[0], { size: 10.5, weight: 600, fill: C.inkSoft })
        c += text(62, y + 34, row[1], { size: 8.5, fill: C.inkFaint })
        c += text(292, y + 27, row[2], { size: 10, fill: C.inkMuted })
        c += text(528, y + 27, row[3], { size: 9.5, fill: C.inkMuted })
        c += text(792, y + 27, row[4], { size: 9.5, fill: C.inkMuted })
        c += text(914, y + 27, row[5], { size: 11, weight: 600, fill: C.ink })
        c += badge(1022, y + 15, row[6], { tone: row[7] })
        if (row[6] === 'Unpaid') c += text(1096, y + 29, 'Collect', { size: 9.5, weight: 600, fill: C.forest700, anchor: 'end' })
        if (index < fines.length - 1) c += tableRowDivider(24, y + 50, 1072)
      })

      c += line(0, 710, 1120, 710, { stroke: C.cream200 })
      c += text(24, 736, 'Unpaid fines block new requests until paid or waived.', { size: 10, fill: C.inkFaint })
      c += text(1096, 736, 'Showing 6 of 10 charges', { size: 9.5, fill: C.inkFaint, anchor: 'end' })

      return appShell({ role: 'librarian', active: 'Fines', content: c, user })
    },
  },
]
