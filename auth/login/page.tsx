'use client'
import styles from "./page.module.css";
import React, { useState, useRef } from 'react';
import { useFormState, useFormStatus } from "react-dom";
import Link from 'next/link';
import {
    Banner,
    Button,
    Input,
    LoadingOverlay
} from "@bbollen23/brutal-paper";
import { authenticate } from '@/app/lib/actions';


export default function LoginPage() {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');



    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (key === 'email') {
            setEmail(event.target.value);
        } else {
            setPassword(event.target.value);
        }
    };

    const [errorMessage, formAction] = useFormState(authenticate, undefined)


    return (
        <form action={formAction}>
            <div className="flex-col">
                {errorMessage ? <div className="login-error-banner">
                    <Banner dense type='alert'>{errorMessage}</Banner>
                </div> : null}
                <div style={{ fontSize: '1.2rem', marginBottom: '40px' }}>
                    Please enter in your credentials.
                </div>
                <Input
                    onChange={(e: any) => handleInputChange(e, 'email')} value={email}
                    label='Email'
                    placeholder="Your Email"
                    type='email'
                    name='email'
                />
                <Input
                    onChange={(e: any) => handleInputChange(e, 'password')} value={password}
                    label='Password'
                    type='password'
                    placeholder="Your Password"
                    name='password'
                />
                <div style={{ marginBottom: '30px' }}>Forgot Password?</div>
                <SubmitButton />
                <Link href="/auth/signup">
                    <div className='link' style={{ width: '100%', textAlign: 'center', marginTop: '50px' }}>Don't Have An Account?</div>
                </Link>
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
            <Button label='Log In' onClick={handleButtonClick} />
            <button style={{ display: 'none' }} ref={hiddenSubmitButtonRef} type='submit'>Log In</button>
        </>
    )
}
