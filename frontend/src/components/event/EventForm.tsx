"use client";
import { AttachmentDTO, EventDTO } from "@/types";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { Button, FormControl, FormLabel, Grid, GridItem, HStack, Input, Select, Switch, Textarea, VStack, useToast } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import api from "@/lib/api/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Schema = Yup.object({
  title: Yup.string().min(3).required(),
  description: Yup.string().min(10).required(),
  type: Yup.mixed().oneOf(["ONSITE","ONLINE"]).required(),
  startDate: Yup.string().required(),
  endDate: Yup.string().required(),
  totalSeats: Yup.number().min(1).nullable().optional()
});

export default function EventForm() {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(values: any, helpers: any) {
    try {
      const uploaded: AttachmentDTO[] = [];
      for (const f of files) {
        const u = await uploadToCloudinary(f);
        uploaded.push({ url: u.secure_url, publicId: u.public_id, type: u.resource_type.startsWith("video") ? "VIDEO" : "IMAGE" });
      }

      const payload = { ...values, totalSeats: values.totalSeats || null, attachments: uploaded };
      const { data } = await api.post("/events", payload);
      toast({ title: "Event created", status: "success" });
      router.push(`/events/${data.id}`);
    } catch (e: any) {
      toast({ title: e?.response?.data?.error || "Create failed", status: "error" });
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={{
        title: "", description: "", type: "ONSITE", venue: "", joinLink: "",
        contactInfo: "", totalSeats: "", requiresApproval: false,
        startDate: "", endDate: ""
      }}
      validationSchema={Schema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form>
          <VStack align="stretch" spacing={4}>
            <FormControl isInvalid={!!errors.title && touched.title}>
              <FormLabel>Title</FormLabel>
              <Field as={Input} name="title" variant="filled" />
            </FormControl>

            <FormControl isInvalid={!!errors.description && touched.description}>
              <FormLabel>Description</FormLabel>
              <Field as={Textarea} name="description" variant="filled" />
            </FormControl>

            <HStack>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Field as={Select} name="type" variant="filled">
                  <option value="ONSITE">Onsite</option>
                  <option value="ONLINE">Online</option>
                </Field>
              </FormControl>
              <FormControl>
                <FormLabel>Total Seats (optional)</FormLabel>
                <Field as={Input} name="totalSeats" type="number" variant="filled" />
              </FormControl>
            </HStack>

            <HStack>
              <FormControl>
                <FormLabel>Venue (for Onsite)</FormLabel>
                <Field as={Input} name="venue" variant="filled" />
              </FormControl>
              <FormControl>
                <FormLabel>Join Link (for Online)</FormLabel>
                <Field as={Input} name="joinLink" variant="filled" />
              </FormControl>
            </HStack>

            <HStack>
              <FormControl>
                <FormLabel>Start DateTime</FormLabel>
                <Field as={Input} name="startDate" type="datetime-local" variant="filled" />
              </FormControl>
              <FormControl>
                <FormLabel>End DateTime</FormLabel>
                <Field as={Input} name="endDate" type="datetime-local" variant="filled" />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Contact Info</FormLabel>
              <Field as={Input} name="contactInfo" variant="filled" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Requires Approval</FormLabel>
              <Field as={Switch} name="requiresApproval" />
            </FormControl>

            <FormControl>
              <FormLabel>Attachments (images/videos)</FormLabel>
              <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </FormControl>

            <Grid templateColumns="repeat(4, 1fr)" gap={3}>
              {files.map((f, i) => (
                <GridItem key={i} fontSize="sm" opacity={0.8}>{f.name}</GridItem>
              ))}
            </Grid>

            <Button type="submit" isLoading={isSubmitting} variant="solid">Create Event</Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
}
