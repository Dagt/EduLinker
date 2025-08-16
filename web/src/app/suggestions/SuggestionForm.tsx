"use client";
import { useForm } from "react-hook-form";

export type SuggestionFormData = {
  title: string;
  description: string;
};

type Props = {
  initial?: SuggestionFormData;
  onSubmit: (data: SuggestionFormData) => void | Promise<void>;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  submitLabel: string;
};

export default function SuggestionForm({ initial, onSubmit, titlePlaceholder, descriptionPlaceholder, submitLabel }: Props){
  const { register, handleSubmit } = useForm<SuggestionFormData>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        placeholder={titlePlaceholder}
        {...register("title", { required: true })}
        style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
      />
      <textarea
        placeholder={descriptionPlaceholder}
        {...register("description", { required: true })}
        style={{ display: "block", margin: "8px 0", padding: 8, width: "100%", minHeight: 120 }}
      />
      <button>{submitLabel}</button>
    </form>
  );
}
