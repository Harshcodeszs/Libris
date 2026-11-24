import {
  BookMarked,
  BookOpen,
  Inbox,
  LayoutDashboard,
  Library,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { ROLE } from '../../lib/constants'

const account = {
  label: 'Account',
  items: [{ to: '/profile', label: 'Profile & settings', icon: UserRound }],
}

export const NAV = {
  [ROLE.STUDENT]: [
    {
      label: 'Library',
      items: [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/catalog', label: 'Browse catalog', icon: Library },
        { to: '/loans', label: 'My loans', icon: BookMarked },
        { to: '/fines', label: 'My fines', icon: ReceiptText },
      ],
    },
    account,
  ],
  [ROLE.LIBRARIAN]: [
    {
      label: 'Operations',
      items: [
        { to: '/librarian', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/requests', label: 'Borrow requests', icon: Inbox },
        { to: '/books', label: 'Books', icon: Library },
        { to: '/loans', label: 'Borrow & return', icon: BookOpen },
        { to: '/students', label: 'Students', icon: Users },
        { to: '/fines', label: 'Fines', icon: ReceiptText },
      ],
    },
    account,
  ],
  [ROLE.SUPER]: [
    {
      label: 'Administration',
      items: [
        { to: '/super', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/super/librarians', label: 'Librarian accounts', icon: ShieldCheck },
      ],
    },
    {
      label: 'Oversight',
      items: [
        { to: '/requests', label: 'Borrow requests', icon: Inbox },
        { to: '/books', label: 'Books', icon: Library },
        { to: '/loans', label: 'Borrow & return', icon: BookOpen },
        { to: '/students', label: 'Students', icon: Users },
        { to: '/fines', label: 'Fines', icon: ReceiptText },
      ],
    },
    account,
  ],
}
