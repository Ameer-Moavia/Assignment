"use client";
import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react";
import { FieldHookConfig, useField } from "formik";

export default function TextInput({ label, ...props }: { label: string } & FieldHookConfig<string>) {
  const [field, meta] = useField(props);
  return (
    <FormControl isInvalid={!!meta.error && meta.touched}>
      <FormLabel>{label}</FormLabel>
      <Input {...field} {...props} variant="filled" />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
}
