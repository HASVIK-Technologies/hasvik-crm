"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import "react-day-picker/style.css";

export default function Calendar(props: DayPickerProps) {
  return <DayPicker {...props} className="crm-calendar" />;
}
