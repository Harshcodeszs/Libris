import {
  C,
  SANS,
  DISPLAY,
  W,
  H,
  rect,
  circle,
  line,
  path,
  text,
  wrap,
  icon,
  badge,
  button,
  avatar,
  card,
  textField,
  publicNav,
  publicFooter,
  brand,
  bookCover,
} from './kit.mjs'

function blobs() {
  return `${circle(1180, 90, 300, { fill: C.forest100, opacity: 0.55 })}${circle(
    1340,
    160,
    200,
    { fill: C.brass100, opacity: 0.5 },
  )}${circle(120, 760, 260, { fill: C.cream200, opacity: 0.6 })}`
}

function authPanel(x, y, w, h) {
  let out = rect(x, y, w, h, { fill: C.forest950, rx: 24 })
  out += circle(x + w - 40, y + 40, 180, { fill: C.forest800, opacity: 0.6 })
  out += circle(x + 40, y + h - 30, 160, { fill: C.brass900, opacity: 0.25 })
  out += brand(x + 36, y + 34, { dark: true })
  return out
}

export const publicScreens = [
  {
    id: '01-landing',
    group: 'Public',
    title: 'Landing page',
    note: 'Hero, borrowing pillars and calls to action for signed-out visitors.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += blobs()
      out += publicNav()

      out += text(40, 168, 'LIBRIS COLLEGE LIBRARY', {
        size: 10.5,
        weight: 700,
        fill: C.brass700,
        letter: 2,
      })
      out += text(40, 240, 'Every book,', { size: 58, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(40, 302, 'accounted for.', {
        size: 58,
        weight: 600,
        family: DISPLAY,
        fill: C.forest700,
        italic: true,
      })
      out += wrap(
        40,
        350,
        'Request a title, get it approved at the desk, and keep every due date in sight. One calm place for borrowing, returns, and fines.',
        64,
        23,
        { size: 15, fill: C.inkMuted },
      )
      out += button(40, 438, 'Browse the catalog', { iconName: 'library', h: 48, w: 196 })
      out += button(248, 438, 'How borrowing works', { variant: 'secondary', h: 48, w: 196 })

      const stats = [
        ['14 days', 'Standard loan period'],
        ['5 books', 'Maximum per student'],
        ['₱5 / day', 'Overdue fine rate'],
      ]
      stats.forEach(([value, label], index) => {
        const x = 40 + index * 216
        out += text(x, 546, value, { size: 24, weight: 600, family: DISPLAY, fill: C.ink })
        out += text(x, 568, label, { size: 11.5, fill: C.inkFaint })
        if (index) out += line(x - 24, 522, x - 24, 566, { stroke: C.cream300 })
      })

      // Shelf composition
      out += rect(744, 120, 656, 468, { fill: C.white, stroke: C.cream300, rx: 24 })
      out += rect(744, 120, 656, 44, { fill: C.cream50, rx: 24 })
      out += rect(744, 150, 656, 14, { fill: C.cream50 })
      out += circle(768, 142, 5, { fill: C.brass400 })
      out += text(784, 147, 'This week on the shelf', { size: 11.5, weight: 600, fill: C.inkSoft })
      out += badge(1356, 128, '24 copies', { tone: 'success', anchor: 'end' })

      out += bookCover(788, 190, 126, { title: 'The Great Gatsby', category: 'Fiction', h: 190, author: 'Fitzgerald' })
      out += bookCover(936, 190, 126, { title: 'Sapiens', category: 'History', h: 190, author: 'Harari' })
      out += bookCover(1084, 190, 126, { title: 'Clean Code', category: 'Technology', h: 190, author: 'Martin' })
      out += bookCover(1232, 190, 126, { title: 'Atomic Habits', category: 'Self-Help', h: 190, author: 'Clear' })

      out += rect(776, 418, 600, 128, { fill: C.cream50, stroke: C.cream200, rx: 16 })
      out += circle(820, 482, 22, { fill: C.forest100 })
      out += icon('checkcircle', 808, 470, 24, C.forest700)
      out += text(858, 466, 'Atomic Habits was just approved', { size: 13.5, weight: 600, fill: C.ink })
      out += text(858, 486, 'Due November 19 · Juan Dela Cruz', { size: 11.5, fill: C.inkMuted })
      out += badge(1340, 462, 'On loan', { tone: 'success', anchor: 'end' })
      out += badge(1340, 494, '14-day loan', { tone: 'neutral', anchor: 'end' })

      out += text(744, 628, 'Built around the desk, not around the paperwork.', {
        size: 13,
        weight: 500,
        family: DISPLAY,
        fill: C.inkMuted,
        italic: true,
      })

      // Feature trio
      const features = [
        ['inbox', 'Request in seconds', 'Students ask for a copy online. The shelf stays accurate while the desk reviews.'],
        ['checkcircle', 'Approve with confidence', 'One click issues the loan, starts the 14-day clock and records who approved it.'],
        ['receipt', 'Fines without friction', 'Overdue charges calculate themselves. Pay, waive or issue a manual fine in one place.'],
      ]
      features.forEach(([iconName, title, body], index) => {
        const x = 40 + index * 466
        out += rect(x, 660, 442, 150, { fill: C.white, stroke: C.cream300, rx: 20 })
        out += rect(x + 24, 684, 40, 40, { fill: C.forest50, rx: 11 })
        out += icon(iconName, x + 35, 695, 18, C.forest700)
        out += text(x + 24, 754, title, { size: 17, weight: 600, family: DISPLAY, fill: C.ink })
        out += wrap(x + 24, 776, body, 56, 17, { size: 11.5, fill: C.inkMuted })
      })

      out += publicFooter(844)
      return out
    },
  },
  {
    id: '02-login',
    group: 'Public',
    title: 'Sign in',
    note: 'Single sign-in for students, librarians and superlibrarians. Role is detected from the account.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += circle(1080, 120, 340, { fill: C.forest100, opacity: 0.5 })
      out += circle(180, 800, 260, { fill: C.brass100, opacity: 0.4 })

      out += authPanel(0, 0, 620, 900)
      out += text(56, 182, 'The quiet heart', { size: 44, weight: 600, family: DISPLAY, fill: C.cream50 })
      out += text(56, 234, 'of campus.', {
        size: 44,
        weight: 600,
        family: DISPLAY,
        fill: C.brass300,
        italic: true,
      })
      out += wrap(
        56,
        288,
        'One account for browsing, requests, loans and fines. Your role decides what you see after you sign in.',
        52,
        23,
        { size: 14, fill: 'rgba(250,247,241,0.65)' },
      )

      const bullets = [
        ['bookmark', 'Fourteen-day loans with clear due dates'],
        ['inbox', 'Requests reviewed by a real librarian'],
        ['receipt', 'Fines tracked to the last peso'],
      ]
      bullets.forEach(([iconName, label], index) => {
        const y = 382 + index * 48
        out += circle(66, y + 12, 12, { fill: 'rgba(255,255,255,0.08)' })
        out += icon(iconName, 58, y + 4, 16, C.brass300)
        out += text(92, y + 17, label, { size: 13, fill: 'rgba(250,247,241,0.8)' })
      })

      out += rect(40, 610, 540, 210, { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.1)', rx: 20 })
      out += text(64, 646, 'DEMO ACCESS', { size: 9, weight: 700, fill: 'rgba(250,247,241,0.4)', letter: 1.6 })
      ;[
        ['Superlibrarian', 'super@library.test', 'Super@123'],
        ['Librarian', 'librarian@library.test', 'Librarian@123'],
        ['Student', 'juan.delacruz@gmail.com', 'Student@123'],
      ].forEach(([label, email, password], index) => {
        const y = 670 + index * 46
        out += text(64, y, label, { size: 10, weight: 600, fill: C.brass300 })
        out += text(64, y + 15, `${email} · ${password}`, { size: 10.5, fill: 'rgba(250,247,241,0.6)' })
        out += text(556, y + 10, 'Use', { size: 10.5, weight: 600, fill: C.cream50, anchor: 'end' })
      })

      // Form card
      out += card(724, 80, 600, 740, { rx: 24 })
      out += text(764, 138, 'Welcome back', { size: 30, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(764, 164, 'Sign in to continue to your library dashboard.', { size: 12.5, fill: C.inkMuted })

      out += textField(764, 214, 520, {
        label: 'Email address',
        value: 'juan.delacruz@gmail.com',
        iconName: 'mail',
      })
      out += textField(764, 294, 520, {
        label: 'Password',
        value: 'Student@123',
        iconName: 'lock',
      })
      out += icon('eye', 1252, 334, 16, C.inkFaint)

      out += rect(764, 366, 16, 16, { fill: C.forest800, rx: 4 })
      out += icon('check', 765, 367, 14, C.white, 2.4)
      out += text(788, 379, 'Remember this device', { size: 12, fill: C.inkSoft })
      out += text(1284, 379, 'Forgot password?', { size: 12, weight: 600, fill: C.forest700, anchor: 'end' })

      out += button(764, 410, 'Sign in', { h: 46, w: 520 })
      out += icon('arrowright', 1244, 425, 17, C.cream50)

      out += line(764, 490, 1284, 490, { stroke: C.cream200 })
      out += rect(984, 482, 80, 16, { fill: C.white })
      out += text(1024, 494, 'or use a demo account', { size: 10.5, fill: C.inkFaint, anchor: 'middle' })

      ;[
        ['AR', 'super', 'Aurora Reyes', 'Superlibrarian', 'super@library.test'],
        ['ML', 'librarian', 'Maria Lopez', 'Librarian', 'librarian@library.test'],
        ['JD', 'student', 'Juan Dela Cruz', 'Student', 'juan.delacruz@gmail.com'],
      ].forEach(([initials, role, name, label, email], index) => {
        const y = 512 + index * 62
        out += rect(764, y, 520, 52, { fill: C.cream50, stroke: C.cream200, rx: 12 })
        out += avatar(776, y + 10, 32, { initials, role })
        out += text(820, y + 22, name, { size: 12, weight: 600, fill: C.ink })
        out += text(820, y + 37, `${label} · ${email}`, { size: 10, fill: C.inkFaint })
        out += text(1268, y + 29, 'Use', { size: 11, weight: 600, fill: C.forest700, anchor: 'end' })
      })

      out += text(1024, 734, 'New to Libris?', { size: 12, fill: C.inkMuted, anchor: 'end' })
      out += text(1032, 734, 'Create a student account', { size: 12, weight: 600, fill: C.forest700 })
      out += line(764, 770, 1284, 770, { stroke: C.cream200 })
      out += icon('info', 764, 786, 14, C.inkFaint)
      out += text(784, 798, 'Demo only — accounts and passwords live in your browser.', { size: 10.5, fill: C.inkFaint })
      return out
    },
  },
  {
    id: '03-register',
    group: 'Public',
    title: 'Student registration',
    note: 'Gmail-only registration with simulated email confirmation.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += blobs()
      out += publicNav()

      out += card(40, 112, 664, 690, { rx: 24 })
      out += text(76, 166, 'Create your reader account', { size: 28, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(76, 190, 'Students only. Use a Gmail address so we can send the confirmation link.', {
        size: 12,
        fill: C.inkMuted,
      })

      out += textField(76, 224, 292, { label: 'First name', value: 'Juan' })
      out += textField(388, 224, 292, { label: 'Last name', value: 'Dela Cruz' })
      out += textField(76, 304, 604, {
        label: 'Gmail address',
        value: 'juan.delacruz@gmail.com',
        iconName: 'mail',
        hint: 'Only @gmail.com addresses are accepted in this demo.',
      })
      out += textField(76, 392, 292, { label: 'Contact number', value: '0917 123 4567' })
      out += textField(388, 392, 292, { label: 'Student number', value: '2026-00184' })
      out += textField(76, 472, 292, { label: 'Password', value: '••••••••••', iconName: 'lock' })
      out += textField(388, 472, 292, { label: 'Confirm password', value: '••••••••••', iconName: 'lock' })
      out += icon('eye', 620, 512, 16, C.inkFaint)
      out += icon('eye', 932, 512, 16, C.inkFaint)

      out += wrap(76, 558, 'At least 8 characters with one uppercase letter and one number.', 80, 16, {
        size: 11,
        fill: C.inkFaint,
      })

      out += rect(76, 586, 16, 16, { fill: C.forest800, rx: 4 })
      out += icon('check', 77, 587, 14, C.white, 2.4)
      out += text(100, 599, 'I agree to the library rules: 14-day loans, a 5-book limit, and ₱5/day overdue fines.', {
        size: 11,
        fill: C.inkSoft,
      })

      out += button(76, 624, 'Create account', { h: 46, w: 604 })
      out += icon('arrowright', 636, 639, 17, C.cream50)
      out += text(378, 694, 'Already registered?', { size: 12, fill: C.inkMuted, anchor: 'end' })
      out += text(386, 694, 'Sign in instead', { size: 12, weight: 600, fill: C.forest700 })
      out += line(76, 722, 680, 722, { stroke: C.cream200 })
      out += icon('mail', 76, 738, 14, C.inkFaint)
      out += text(96, 750, 'A confirmation email will appear in the Demo Mailbox, not a real inbox.', {
        size: 10.5,
        fill: C.inkFaint,
      })

      // Side panel
      out += authPanel(744, 112, 656, 690)
      out += text(784, 196, 'THREE STEPS TO YOUR', {
        size: 9.5,
        weight: 700,
        fill: 'rgba(228,191,92,0.8)',
        letter: 1.8,
      })
      out += text(784, 236, 'first checked-out book', { size: 28, weight: 600, family: DISPLAY, fill: C.cream50 })

      const steps = [
        ['01', 'Create the account', 'Register with your Gmail address and student details.'],
        ['02', 'Confirm the email', 'Open the simulated link in the Demo Mailbox.'],
        ['03', 'Request a title', 'The desk approves it, and the 14-day clock starts.'],
      ]
      steps.forEach(([number, title, body], index) => {
        const y = 300 + index * 108
        out += circle(804, y + 10, 18, { fill: 'rgba(255,255,255,0.08)', stroke: C.brass400, })
        out += text(804, y + 15, number, { size: 10, weight: 700, fill: C.brass300, anchor: 'middle' })
        out += text(840, y + 10, title, { size: 15, weight: 600, family: DISPLAY, fill: C.cream50 })
        out += wrap(840, y + 32, body, 50, 17, { size: 12, fill: 'rgba(250,247,241,0.6)' })
        if (index < 2) out += line(804, y + 38, 804, y + 94, { stroke: 'rgba(228,191,92,0.35)', dash: '3 4' })
      })

      out += rect(784, 648, 576, 110, { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.1)', rx: 16 })
      out += icon('bookopen', 804, 672, 20, C.brass300)
      out += wrap(
        836,
        684,
        '“Borrowing should feel like asking a librarian, not filling out a form.”',
        54,
        18,
        { size: 12.5, fill: 'rgba(250,247,241,0.8)', italic: true, family: DISPLAY },
      )
      out += text(836, 736, 'Libris design principle', { size: 10, fill: 'rgba(250,247,241,0.45)' })
      return out
    },
  },
  {
    id: '04-verify-email',
    group: 'Public',
    title: 'Verify email',
    note: 'Simulated confirmation link via the floating Demo Mailbox.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += blobs()
      out += publicNav()

      out += card(160, 132, 560, 566, { rx: 24 })
      out += circle(440, 228, 40, { fill: C.forest50, stroke: C.forest100 })
      out += icon('mailcheck', 422, 210, 36, C.forest700)
      out += text(440, 310, 'Check your inbox', { size: 28, weight: 600, family: DISPLAY, fill: C.ink, anchor: 'middle' })
      out += wrap(
        440 - 200,
        340,
        'We sent a confirmation link to the Gmail address below. Open it to activate your reader account.',
        60,
        19,
        { size: 13, fill: C.inkMuted },
      )
      out += rect(200, 404, 480, 42, { fill: C.cream50, stroke: C.cream200, rx: 10 })
      out += icon('mail', 214, 416, 16, C.inkFaint)
      out += text(238, 430, 'juan.delacruz@gmail.com', { size: 13, weight: 500, fill: C.ink })
      out += badge(664, 413, 'Unverified', { tone: 'warning', anchor: 'end' })

      out += button(200, 470, 'Open Demo Mailbox', { iconName: 'inbox', h: 44, w: 480 })
      out += text(440, 540, 'Didn’t get it?', { size: 12, fill: C.inkMuted, anchor: 'end' })
      out += text(448, 540, 'Resend the link', { size: 12, weight: 600, fill: C.forest700 })

      out += line(200, 566, 680, 566, { stroke: C.cream200 })
      const steps = [
        ['1', 'Open the mailbox'],
        ['2', 'Follow the link'],
        ['3', 'Start borrowing'],
      ]
      steps.forEach(([number, label], index) => {
        const x = 200 + index * 158
        out += circle(x + 10, 600, 10, { fill: C.cream100, stroke: C.cream300 })
        out += text(x + 10, 604, number, { size: 10, weight: 700, fill: C.inkMuted, anchor: 'middle' })
        out += text(x + 26, 604, label, { size: 10.5, fill: C.inkSoft })
      })
      out += text(440, 660, 'Back to sign in', { size: 12, weight: 600, fill: C.forest700, anchor: 'middle' })

      // Demo mailbox
      out += card(776, 112, 504, 606, { rx: 20 })
      out += rect(776, 112, 504, 56, { fill: C.forest950, rx: 20 })
      out += rect(776, 148, 504, 20, { fill: C.forest950 })
      out += icon('inbox', 796, 130, 18, C.brass300)
      out += text(822, 142, 'Demo Mailbox', { size: 14, weight: 600, fill: C.cream50 })
      out += badge(1256, 129, 'Simulated', { tone: 'brass', anchor: 'end' })

      out += text(800, 200, 'INBOX · 1 MESSAGE', { size: 9, weight: 700, fill: C.inkFaint, letter: 1.4 })
      out += rect(792, 214, 472, 74, { fill: C.forest50, stroke: C.forest200, rx: 12 })
      out += circle(814, 238, 14, { fill: C.forest100 })
      out += icon('mail', 806, 230, 16, C.forest700)
      out += text(838, 234, 'Libris College Library', { size: 11.5, weight: 600, fill: C.ink })
      out += text(838, 250, 'Confirm your reader account', { size: 10.5, fill: C.inkMuted })
      out += text(1248, 234, 'now', { size: 9.5, fill: C.inkFaint, anchor: 'end' })

      out += line(792, 304, 1264, 304, { stroke: C.cream200 })
      out += text(800, 332, 'Confirm your reader account', { size: 17, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(800, 352, 'Libris College Library · to juan.delacruz@gmail.com', { size: 10, fill: C.inkFaint })
      out += line(792, 368, 1264, 368, { stroke: C.cream200 })

      out += wrap(
        800,
        398,
        'Welcome to Libris, Juan. Confirm your email address to activate your reader account and start requesting books.',
        64,
        19,
        { size: 12, fill: C.inkSoft },
      )

      out += rect(800, 470, 464, 128, { fill: C.cream50, stroke: C.cream200, rx: 14 })
      out += text(822, 498, 'YOUR READER ACCOUNT', { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1.3 })
      out += text(822, 522, 'Juan Dela Cruz', { size: 14, weight: 600, fill: C.ink })
      out += text(822, 542, 'juan.delacruz@gmail.com', { size: 11, fill: C.inkMuted })
      out += badge(1240, 508, 'Student', { tone: 'success', anchor: 'end' })
      out += text(822, 578, '14-day loans · 5-book limit', { size: 10, fill: C.inkFaint })

      out += button(800, 622, 'Confirm email address', { iconName: 'check', h: 44, w: 464 })
      out += text(800, 690, 'This is a simulated email. No real message is sent.', { size: 10, fill: C.inkFaint })

      out += line(160, 740, 680, 740, { stroke: C.cream200 })
      out += icon('info', 160, 756, 14, C.inkFaint)
      out += text(180, 768, 'Confirmation links expire after 24 hours. The mailbox is available on every public page.', {
        size: 10.5,
        fill: C.inkFaint,
      })
      return out
    },
  },
  {
    id: '05-forgot-password',
    group: 'Public',
    title: 'Forgot password',
    note: 'Sends a simulated reset link to the demo mailbox.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += blobs()
      out += publicNav()

      out += card(200, 168, 520, 470, { rx: 24 })
      out += rect(236, 204, 40, 40, { fill: C.brass50, rx: 12 })
      out += icon('key', 247, 215, 18, C.brass700)
      out += text(236, 282, 'Forgot your password?', { size: 26, weight: 600, family: DISPLAY, fill: C.ink })
      out += wrap(
        236,
        308,
        'Enter the email on your account. We will send a reset link to the Demo Mailbox.',
        58,
        18,
        { size: 12.5, fill: C.inkMuted },
      )

      out += textField(236, 362, 448, {
        label: 'Email address',
        value: 'juan.delacruz@gmail.com',
        iconName: 'mail',
      })
      out += button(236, 438, 'Send reset link', { h: 44, w: 448 })
      out += icon('arrowright', 648, 453, 17, C.cream50)

      out += line(236, 512, 684, 512, { stroke: C.cream200 })
      out += icon('arrowleft', 236, 532, 15, C.inkMuted)
      out += text(260, 544, 'Back to sign in', { size: 12, weight: 600, fill: C.forest700 })
      out += text(684, 544, 'Need an account? Register', {
        size: 11,
        fill: C.inkFaint,
        anchor: 'end',
      })
      out += text(460, 600, 'For security, reset links expire after 60 minutes.', {
        size: 10.5,
        fill: C.inkFaint,
        anchor: 'middle',
      })

      // Mailbox preview
      out += card(796, 140, 484, 520, { rx: 20 })
      out += rect(796, 140, 484, 54, { fill: C.forest950, rx: 20 })
      out += rect(796, 174, 484, 20, { fill: C.forest950 })
      out += icon('inbox', 814, 157, 17, C.brass300)
      out += text(838, 170, 'Demo Mailbox', { size: 13, weight: 600, fill: C.cream50 })
      out += badge(1258, 156, '1 new', { tone: 'brass', anchor: 'end' })

      out += text(820, 228, 'LIBRIS COLLEGE LIBRARY', { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1.3 })
      out += text(820, 258, 'Reset your Libris password', { size: 19, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(820, 278, 'to juan.delacruz@gmail.com · just now', { size: 10, fill: C.inkFaint })
      out += line(820, 296, 1256, 296, { stroke: C.cream200 })
      out += wrap(
        820,
        324,
        'We received a request to reset the password for your reader account. Use the button below to choose a new one.',
        62,
        18,
        { size: 12, fill: C.inkSoft },
      )
      out += button(820, 388, 'Choose a new password', { h: 42, w: 436 })
      out += text(820, 462, 'If you did not request this, you can ignore the email. Your password will not change.', {
        size: 10,
        fill: C.inkFaint,
      })
      out += rect(820, 494, 436, 80, { fill: C.brass50, stroke: C.brass100, rx: 12 })
      out += icon('info', 836, 510, 16, C.brass700)
      out += wrap(860, 522, 'Demo mode: this link is simulated and appears only in the on-screen mailbox.', 46, 15, {
        size: 10.5,
        fill: C.brass900,
      })
      out += text(820, 612, 'Libris College Library · demo build', { size: 9.5, fill: C.inkFaint })
      return out
    },
  },
  {
    id: '06-reset-password',
    group: 'Public',
    title: 'Reset password',
    note: 'Verifies the simulated token and sets a new password.',
    render() {
      let out = rect(0, 0, W, H, { fill: C.cream100 })
      out += blobs()
      out += publicNav()

      out += card(420, 148, 600, 600, { rx: 24 })
      out += rect(456, 184, 40, 40, { fill: C.forest50, rx: 12 })
      out += icon('lock', 467, 195, 18, C.forest700)
      out += text(456, 262, 'Choose a new password', { size: 26, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(456, 286, 'Resetting the password for juan.delacruz@gmail.com.', { size: 12, fill: C.inkMuted })

      out += rect(456, 310, 528, 38, { fill: C.forest50, stroke: C.forest200, rx: 10 })
      out += icon('checkcircle', 468, 319, 16, C.forest700)
      out += text(492, 334, 'Reset link verified — valid for another 58 minutes.', { size: 10.5, fill: C.forest800 })

      out += textField(456, 378, 528, { label: 'New password', value: '••••••••••', iconName: 'lock' })
      out += icon('eye', 950, 418, 16, C.inkFaint)
      out += textField(456, 458, 528, { label: 'Confirm new password', value: '••••••••••', iconName: 'lock' })
      out += icon('eye', 950, 498, 16, C.inkFaint)

      const rules = [
        ['check', 'At least 8 characters', true],
        ['check', 'One uppercase letter', true],
        ['check', 'One number', true],
        ['check', 'Different from the old password', false],
      ]
      rules.forEach(([iconName, label, met], index) => {
        const x = 456 + (index % 2) * 264
        const y = 536 + Math.floor(index / 2) * 22
        out += icon(iconName, x, y - 11, 13, met ? C.forest600 : C.inkFaint, 2)
        out += text(x + 20, y, label, { size: 10.5, fill: met ? C.inkSoft : C.inkFaint })
      })

      out += button(456, 594, 'Update password', { h: 44, w: 528 })
      out += line(456, 662, 984, 662, { stroke: C.cream200 })
      out += icon('arrowleft', 456, 682, 15, C.inkMuted)
      out += text(480, 694, 'Back to sign in', { size: 12, weight: 600, fill: C.forest700 })
      out += text(984, 694, 'This demo stores passwords locally only.', { size: 10.5, fill: C.inkFaint, anchor: 'end' })

      out += text(720, 786, 'After saving, all active sessions would be signed out in a real system.', {
        size: 10.5,
        fill: C.inkFaint,
        anchor: 'middle',
      })
      return out
    },
  },
]
