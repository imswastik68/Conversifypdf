"use client";

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";


function Provider({ children }: { children: ReactNode }) {

    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    return (
        <div>
            <ConvexProvider client={convex}>
                {children}
            </ConvexProvider>
        </div>
    );
  }

export default Provider;
