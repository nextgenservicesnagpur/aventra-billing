"use client";

import { useRef } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
} from "react";
import { Input } from "@/shared/components/form/Input";

export const OTP_CODE_LENGTH = 6;

export type OtpCode = [string, string, string, string, string, string];

export const EMPTY_OTP_CODE: OtpCode = ["", "", "", "", "", ""];

export type OtpInputProps = {
  value: OtpCode;
  onChange: (code: OtpCode) => void;
};

/**
 * Six-slot verification code input. Fully controlled over a fixed-length
 * tuple: every slot has a stable index and updating one slot never touches
 * the others. Typing sets the focused slot and advances, Backspace clears,
 * arrows move, and paste/autofill distributes across slots. Screen readers
 * get a grouped fieldset with per-slot labels.
 */
export const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const slotsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusSlot = (index: number) => {
    slotsRef.current[
      Math.min(Math.max(index, 0), OTP_CODE_LENGTH - 1)
    ]?.focus();
  };

  const setSlotRef =
    (index: number) => (element: HTMLInputElement | null) => {
      if (element !== null) {
        slotsRef.current[index] = element;
      }
    };

  const copyCode = (): OtpCode => [
    value[0],
    value[1],
    value[2],
    value[3],
    value[4],
    value[5],
  ];

  const setSlot = (index: number, digit: string) => {
    const next = copyCode();
    next[index] = digit;
    onChange(next);
  };

  const distributeFrom = (index: number, digits: string) => {
    const next = copyCode();
    digits
      .slice(0, OTP_CODE_LENGTH - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    onChange(next);
    focusSlot(index + digits.length);
  };

  const handleSlotChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const incoming = event.target.value.replace(/\D/g, "");
    if (incoming.length <= 1) {
      setSlot(index, incoming);
      if (incoming !== "") {
        focusSlot(index + 1);
      }
      return;
    }
    distributeFrom(index, incoming);
  };

  const handleSlotKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSlot(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSlot(index + 1);
      return;
    }
    if (event.key === "Backspace" && value[index] === "") {
      if (index === 0) {
        return;
      }
      event.preventDefault();
      setSlot(index - 1, "");
      focusSlot(index - 1);
    }
  };

  const handleSlotPaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length === 0) {
      return;
    }
    distributeFrom(index, pasted);
  };

  const handleSlotFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <fieldset>
      <legend className="sr-only">Verification code</legend>
      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: OTP_CODE_LENGTH }, (_, index) => (
          <Input
            key={index}
            ref={setSlotRef(index)}
            value={value[index]}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSlotChange(index, event)
            }
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
              handleSlotKeyDown(index, event)
            }
            onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
              handleSlotPaste(index, event)
            }
            onFocus={handleSlotFocus}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} of ${OTP_CODE_LENGTH}`}
            className="h-14 min-w-0 flex-1 px-0 text-center text-lg font-semibold"
          />
        ))}
      </div>
    </fieldset>
  );
};
