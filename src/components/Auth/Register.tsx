import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { postData } from "../apis/baseUrl"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { AuthLayout } from "./AuthLayout"
import { AuthLoadingBanner } from "./AuthLoadingBanner"

type RegisterFormValues = {
    full_name: string
    email: string
    password: string
    password_confirm: string
}

export const RegisterForm = () => {

    const navigate = useNavigate()
    const [apiError, setApiError] = useState<string | null>(null);


    const form = useForm<RegisterFormValues>({
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            password_confirm: ""
        }
    })

    const { isSubmitting } = form.formState

    const onSubmit = async (values: RegisterFormValues) => {
        const { success, data, error } = await postData("/auth/register", values);

        if (success) {
            navigate("/");
        } else {
            setApiError(typeof error === "string" ? error : error?.message || "Login failed. Please try again.");

        }
    }

    return (
        <AuthLayout>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white w-full max-w-md p-8 rounded-3xl" style={{ backgroundColor: "#242730" }}>
                    <h2 className="text-2xl font-bold text-[#1FBAD6] text-center">Create Account</h2>
                    <p className="text-center text-gray-400 text-sm">Sign up to get started</p>

                    <AuthLoadingBanner loading={isSubmitting} message="Creating your account…" />

                    {/* Full Name */}
                    <FormField
                        name="full_name"
                        control={form.control}
                        rules={{ required: "Enter Your Name" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your full name"
                                        {...field}
                                        className="rounded-xl px-4 py-2 border border-gray-600 focus:border-[#1FBAD6] focus:ring focus:ring-[#1FBAD6]/30"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        name="email"
                        control={form.control}
                        rules={{ required: "Email is required" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your email"
                                        {...field}
                                        className="rounded-xl px-4 py-2 border border-gray-600 focus:border-[#1FBAD6] focus:ring focus:ring-[#1FBAD6]/30"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        name="password"
                        control={form.control}
                        rules={{ required: "Password is required" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        {...field}
                                        className="rounded-xl px-4 py-2 border border-gray-600 focus:border-[#1FBAD6] focus:ring focus:ring-[#1FBAD6]/30"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirm Password */}
                    <FormField
                        name="password_confirm"
                        control={form.control}
                        rules={{ required: "Confirm Your Password" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Confirm your password"
                                        {...field}
                                        className="rounded-xl px-4 py-2 border border-gray-600 focus:border-[#1FBAD6] focus:ring focus:ring-[#1FBAD6]/30"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {apiError && (
                        <p className="text-red-500 text-sm text-center">{apiError}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1FBAD6] hover:bg-[#17a0c0] text-black font-bold py-2 rounded-xl disabled:opacity-60"
                    >
                        Register
                    </Button>

                    <p className="text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <span
                            className="text-[#1FBAD6] hover:underline font-semibold cursor-pointer"
                            onClick={() => navigate("/")}
                        >
                            Login
                        </span>
                        !
                    </p>
                </form>
            </Form>
        </AuthLayout>
    )
}
