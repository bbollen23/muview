'use client'
import styles from "./page.module.css";
import React, { useState, useRef } from 'react';
import { useFormState, useFormStatus } from "react-dom";
import Link from 'next/link';
import {
    Button,
    Input,
    LoadingOverlay,
    Banner
} from "@bbollen23/brutal-paper";


export default function SignupPage() {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (key === 'email') {
            setEmail(event.target.value);
        } else if (key === 'password') {
            setPassword(event.target.value);
        } else {
            setConfirmPassword(event.target.value);
        }
    };

    const passwordValidator = (value: string) => {
        return value.length > 8;
    };

    const confirmPasswordValidator = (value: string) => {
        return value === password;
    }

    const [errorMessage, formAction] = useFormState(signUp, undefined);


    <Input
        onChange={(e: any) => handleInputChange(e, 'password')} value={password}
        label='Password'
        type='password'
        placeholder="Your Password"
        name='password'
    />
    return (
        <form action={formAction}>
            <div className="flex-col" style={{ gap: '20px' }}>
                {errorMessage ? <div className="login-error-banner">
                    <Banner dense type='alert'>{errorMessage}</Banner>
                </div> : null}
                <div style={{ fontSize: '1.2rem', marginBottom: '40px' }}>
                    Please enter in your credentials.
                </div>
                <Input
                    onChange={(e: any) => handleInputChange(e, 'email')} value={email}
                    label='Email'
                    placeholder="Your email"
                    type='email'
                    name='email'
                />
                <Input
                    onChange={(e: any) => handleInputChange(e, 'password')} value={password}
                    label='Password'
                    type='password'
                    placeholder="Your Password"
                    validator={passwordValidator}
                    errorMessage="Password must be at least 8 characters in length."
                    name='password'
                />
                <Input
                    onChange={(e: any) => handleInputChange(e, 'confirm-password')} value={confirmPassword}
                    label='Confirm Password'
                    type='password'
                    placeholder="Re-type your Password"
                    validator={confirmPasswordValidator}
                    errorMessage="Passwords do not match. "
                    name='password'
                />
                <SubmitButton />
            </div>
        </form>
    )
}

const SubmitButton = () => {
    const handleButtonClick = () => {
        if (hiddenSubmitButtonRef.current) {
            hiddenSubmitButtonRef.current.click();
        }
    };

    const hiddenSubmitButtonRef = useRef<HTMLButtonElement | null>(null);
    const { pending } = useFormStatus();

    return (
        <>
            <LoadingOverlay visible={pending} />
            <Button label='Sign Up' onClick={handleButtonClick} />
            <button style={{ display: 'none' }} ref={hiddenSubmitButtonRef} type='submit'></button>
        </>
    )
}
