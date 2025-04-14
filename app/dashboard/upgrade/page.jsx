'use client'
import React from 'react';
import planData from '../../../utils/planData';
import { useUser } from '@clerk/nextjs';

function Upgrade() {
    const { user } = useUser();

    return (
        <div className="p-10">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8">
                    {planData.map((item, index) => (
                        <div key={index} className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {item.name}
                                    <span className="sr-only"> Plan</span>
                                </h2>

                                <p className="mt-2 sm:mt-4">
                                    <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">{item.cost}$</strong>
                                    <span className="text-sm font-medium text-gray-700">/month</span>
                                </p>
                            </div>

                            <ul className="mt-6 space-y-2">
                                {item.offering.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-m">{feature.value}</span>
                                    </li>
                                ))}
                            </ul>

                            {item.paymentLink ? (
                                <a
                                    href={`${item.paymentLink}?prefilled_email=${user?.primaryEmailAddress?.emailAddress}`}
                                    target="_blank"
                                    className="mt-8 block rounded-full border border-indigo-600 bg-white px-12 py-3 text-center text-sm font-medium text-indigo-600 hover:ring-1 hover:ring-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
                                >
                                    Get Started
                                </a>
                            ) : (
                                <p className="mt-8 text-center text-sm text-gray-500">You are on this plan</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Upgrade;
