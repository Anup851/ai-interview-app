import { FileText, Settings, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import ThemeToggle from '../components/common/ThemeToggle.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { uploadProfileResume } from '../services/profileService.js'
import { getActiveResume } from '../services/resumeService.js'

export default function ProfilePage() {
  const fileRef = useRef(null)
  const { pushToast } = useToast()
  const { user, profile: authProfile, updateProfile: saveAuthProfile, signOut, isConfigured } = useAuth()
  const [profile, setProfile] = useState({
    name: isConfigured ? '' : 'Dana Smith',
    email: isConfigured ? '' : 'dana@example.com',
    role: isConfigured ? '' : 'Senior Frontend Engineer'
  })
  const [resume, setResume] = useState(isConfigured ? '' : 'Dana_Smith_Resume.pdf')
  const [reminders, setReminders] = useState(authProfile?.email_reminders ?? true)
  const readiness = useMemo(() => {
    const completed = [profile.name, profile.email, profile.role, resume].filter(Boolean).length
    return Math.round((completed / 4) * 100)
  }, [profile, resume])

  useEffect(() => {
    if (!authProfile) return
    setProfile({
      name: authProfile.full_name || '',
      email: authProfile.email || '',
      role: authProfile.target_role || ''
    })
    setReminders(authProfile.email_reminders ?? true)
  }, [authProfile])

  useEffect(() => {
    if (!isConfigured) return
    getActiveResume(user?.id)
      .then((activeResume) => setResume(activeResume?.file_name || ''))
      .catch(() => setResume(''))
  }, [isConfigured, user?.id])

  const updateProfile = (event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
  const saveProfile = async () => {
    try {
      await saveAuthProfile({
        full_name: profile.name,
        email: profile.email,
        target_role: profile.role,
        email_reminders: reminders
      })
      pushToast('Profile saved.')
    } catch (error) {
      pushToast(error.message || 'Could not save profile.', 'info')
    }
  }
  const updateResume = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    try {
      const uploaded = await uploadProfileResume({ userId: user?.id, file })
      setResume(uploaded.file_name)
      pushToast('Resume uploaded and set as active.')
    } catch (error) {
      pushToast(error.message || 'Resume upload failed.', 'info')
    }
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">User Profile</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Manage identity, resumes, preferences, and workspace settings.</p></header>
      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Card><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xl font-extrabold text-white">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'U'}</div><div><h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">{profile.name || 'Your name'}</h2><p className="text-sm text-zinc-500">{profile.role || 'Target role'}</p></div></div><div className="mt-6 grid gap-4"><Input label="Full name" name="name" value={profile.name} onChange={updateProfile} /><Input label="Email" name="email" value={profile.email} onChange={updateProfile} /><Input label="Target role" name="role" value={profile.role} onChange={updateProfile} /><Button onClick={saveProfile}>Save profile</Button></div></Card>
        <div className="grid gap-6">
          <Card><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><h2 className="text-lg font-extrabold">Resume management</h2></div><div className="mt-5 grid gap-3"><div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-white/5"><div><p className="font-bold">{resume || 'No active resume'}</p><p className="text-sm text-zinc-500">{resume ? 'Saved to your account' : 'Upload a PDF to set one active resume'}</p></div>{resume ? <Badge color="emerald">Active</Badge> : <Badge color="zinc">Empty</Badge>}</div><input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={updateResume} /><Button variant="outline" onClick={() => fileRef.current?.click()}>Upload new resume</Button></div></Card>
          <Card><div className="flex items-center gap-3"><Settings className="h-5 w-5 text-primary" /><h2 className="text-lg font-extrabold">Settings</h2></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-50 p-4 dark:bg-white/5"><div><p className="font-bold">Theme switcher</p><p className="text-sm text-zinc-500">Toggle light and dark mode.</p></div><ThemeToggle /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-50 p-4 dark:bg-white/5"><div><p className="font-bold">Email reminders</p><p className="text-sm text-zinc-500">Weekly preparation summary.</p></div><input type="checkbox" checked={reminders} onChange={(event) => { setReminders(event.target.checked); pushToast(event.target.checked ? 'Email reminders enabled.' : 'Email reminders disabled.') }} className="h-5 w-5 rounded border-zinc-300 text-primary focus:ring-primary" /></div></Card>
          <Button variant="outline" onClick={signOut}>Log out</Button>
        </div>
      </section>
      <Card><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-primary" /><h2 className="text-lg font-extrabold">Account readiness</h2></div><div className="mt-4 h-3 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${readiness}%` }} /></div><p className="mt-3 text-sm text-zinc-500">Profile is {readiness}% complete based on your saved name, email, target role, and active resume.</p></Card>
    </div>
  )
}
