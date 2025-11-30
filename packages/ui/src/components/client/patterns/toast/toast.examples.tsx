/**
 * Toast Component Examples
 * Usage examples for the Toast Layer 3 pattern component
 */

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  useToast,
} from "./toast";

/**
 * Basic toast setup
 */
export function ToastSetup() {
  return (
    <ToastProvider>
      <div>Your app content</div>
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Basic toast
 */
export function BasicToast() {
  return (
    <ToastProvider>
      <Toast description="This is a basic toast message" />
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Toast with title
 */
export function ToastWithTitle() {
  return (
    <ToastProvider>
      <Toast
        title="Toast Title"
        description="This toast has both a title and description"
      />
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Toast variants
 */
export function ToastVariants() {
  return (
    <ToastProvider>
      <div className="flex flex-col gap-2">
        <Toast variant="default" description="Default toast" />
        <Toast variant="info" title="Info" description="Information toast" />
        <Toast
          variant="success"
          title="Success"
          description="Operation completed successfully"
        />
        <Toast
          variant="warning"
          title="Warning"
          description="Please review this warning"
        />
        <Toast variant="error" title="Error" description="An error has occurred" />
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Toast with action
 */
export function ToastWithAction() {
  return (
    <ToastProvider>
      <Toast
        title="File uploaded"
        description="Your file has been uploaded successfully"
        action={
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
            View
          </button>
        }
      />
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Non-dismissible toast
 */
export function NonDismissibleToast() {
  return (
    <ToastProvider>
      <Toast
        variant="info"
        title="Processing"
        description="This toast cannot be dismissed"
        dismissible={false}
      />
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Toast with custom duration
 */
export function ToastWithCustomDuration() {
  return (
    <ToastProvider duration={10000}>
      <Toast
        title="Long message"
        description="This toast will stay for 10 seconds"
      />
      <ToastViewport />
    </ToastProvider>
  );
}

/**
 * Using toast hook
 */
export function ToastWithHook() {
  const { toast } = useToast();

  return (
    <ToastProvider>
      <button
        onClick={() =>
          toast({
            variant: "success",
            title: "Success",
            description: "Toast shown using hook",
          })
        }
      >
        Show Toast
      </button>
      <ToastViewport />
    </ToastProvider>
  );
}

