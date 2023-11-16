import { ComponentType, Suspense } from "react";

export function suspense<T extends object = Record<string, never>>(
    Component: ComponentType<T>,
    Fallback: React.FC<T> | string = ""
) {
    const ComponentWithSuspense = (componentProps: T) => {
        return (
            <Suspense
                fallback={
                    typeof Fallback === "string" ? (
                        Fallback
                    ) : (
                        <Fallback {...componentProps} />
                    )
                }
            >
                <Component {...componentProps} />
            </Suspense>
        );
    };
    ComponentWithSuspense.displayName = `suspense(${Component.displayName || Component.name
        })`;
    return ComponentWithSuspense;
}
