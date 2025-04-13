'use client'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem
} from "@heroui/react";

// Then in your JSX, replace <label> with:
// <label className="block text-sm font-medium text-gray-700">

import useCurrentUser from '@/app/hooks/useUser';
import { toast } from 'react-toastify';

interface FacultyProfile {
  _id?: string
  first_name: string
  middle_name: string
  last_name: string
  dob: string
  address: string
  city: string
  state: string
  district: string
  gender: string
  email: string
  alt_email: string
  ph_no: string
  alt_ph: string
  program: string
}

const Profile = () => {
  const { user, userloading } = useCurrentUser()
  const [profile, setProfile] = useState<FacultyProfile>({
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    district: '',
    gender: '',
    email: '',
    alt_email: '',
    ph_no: '',
    alt_ph: '',
    program: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !user._id) return
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/get-user/${user._id}`)
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        toast.error("Failed to fetch profile data")
      }
    }

    if (!userloading) {
      fetchProfile()
    }
  }, [user, userloading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      if (!profile._id) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faculty/update/${profile._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  if (userloading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardHeader>Faculty Profile</CardHeader>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="first_name">First Name</label>
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="middle_name">Middle Name</label>
              <Input
                id="middle_name"
                name="middle_name"
                value={profile.middle_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name">Last Name</label>
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alt_email">Alternative Email</label>
              <Input
                id="alt_email"
                name="alt_email"
                type="email"
                value={profile.alt_email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ph_no">Phone Number</label>
              <Input
                id="ph_no"
                name="ph_no"
                value={profile.ph_no}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alt_ph">Alternative Phone</label>
              <Input
                id="alt_ph"
                name="alt_ph"
                value={profile.alt_ph}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender">Gender</label>
                <Select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('gender', e.target.value)}
                disabled={!isEditing}
                >
                <SelectItem key="Male">Male</SelectItem>
                <SelectItem key="Female">Female</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="program">Program</label>
                <Select
                id="program"
                name="program"
                value={profile.program}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('program', e.target.value)}
                disabled={!isEditing}
                >
                <SelectItem key="MCA">MCA</SelectItem>
                <SelectItem key="MBA">MBA</SelectItem>
                <SelectItem key="BCA">BCA</SelectItem>
                <SelectItem key="BBA">BBA</SelectItem>
                </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="city">City</label>
              <Input
                id="city"
                name="city"
                value={profile.city}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="district">District</label>
              <Input
                id="district"
                name="district"
                value={profile.district}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state">State</label>
              <Input
                id="state"
                name="state"
                value={profile.state}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            {!isEditing ? (
              <Button color='primary' onPress={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button variant="shadow" color='warning' onPress={() => setIsEditing(false)}>Cancel</Button>
                <Button onPress={handleSubmit}>Save Changes</Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default Profile


