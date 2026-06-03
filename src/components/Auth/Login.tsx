import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { getCurrentUser, postData } from "../apis/baseUrl"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { AuthLayout } from "./AuthLayout"
import { AuthLoadingBanner } from "./AuthLoadingBanner"


type LoginFormValues = {
    email: string
    password: string
}

export const LoginForm = () => {

    const navigate = useNavigate()
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        defaultValues: { email: "", password: "" }
    })

    const { isSubmitting } = form.formState

    const onSubmit = async (values: LoginFormValues) => {
        const { success, data, error } = await postData("/auth/login", values);

        if (success) {
            try {
                localStorage.setItem("token", data.access_token);
                await getCurrentUser();
                navigate("/map");
            } catch (err) {
                setApiError("Something went wrong. Please try again.");
            }
        } else {
            console.log("Login response:", data)
            setApiError(typeof error === "string" ? error : error?.message || "Login failed. Please try again.");
        }
    }

    return (
        <AuthLayout>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
                    <h2 className="text-2xl font-bold text-[#1FBAD6] text-center">Welcome Back</h2>
                    <p className="text-center text-gray-400 text-sm">Login to your account to continue</p>

                    <AuthLoadingBanner loading={isSubmitting} message="Signing you in…" />

                    <FormField
                        name="email"
                        rules={{ required: "Email is required" }}
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} className="rounded-xl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="password"
                        control={form.control}
                        rules={{ required: "Enter Your Password" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter your password" {...field} className="rounded-xl" />
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
                        Login
                    </Button>

                    <p className="text-center text-gray-400 text-sm cursor-pointer hover:text-[#1FBAD6]">
                        Forgot password?
                    </p>
                    <p className="text-center text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <span
                            className="text-[#1FBAD6] hover:underline font-semibold cursor-pointer"
                            onClick={() => navigate("/register")}
                        >
                            Create one
                        </span>
                        !
                    </p>


                </form>
            </Form>
        </AuthLayout>
    )
}
