"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  NumberInput,
  NumberInputField,
  Divider,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Wrap,
  WrapItem,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  InputGroup,
  InputLeftElement,
  FormErrorMessage
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLink,
  FaClock,
  FaChartBar,
  FaFilter,
  FaSearch,
  FaStar,
  FaHeart,
  FaShare,
  FaDownload,
  FaUpload,
  FaVideo,
  FaImage,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaRocket,
  FaFire,
  FaCrown,
  FaGem,
  FaLightbulb,
  FaThumbsUp,
  FaComments,
  FaEllipsisV,
  FaArrowRight,
  FaArrowLeft,
  FaMinus,

} from 'react-icons/fa';
import { BiRefresh } from 'react-icons/bi';
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { apiFormData } from "@/utils/Functions/helperApi";
import { useUserStore } from "@/utils/stores/useUserStore";
import { useCompanyStore } from '@/utils/stores/useCompanyStore';
import Header from '@/components/layout/Header';
import TeamMembersSection from '@/components/dashboard/TeamMembersSection';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);



// Mock data structure matching your backend
const mockEvents = [
  {
    id: 1,
    title: "Tech Innovation Summit 2025",
    description: "Join industry leaders for cutting-edge discussions on AI, blockchain, and the future of technology. Network with innovators and discover game-changing solutions.",
    type: "CONFERENCE",
    venue: "Silicon Valley Convention Center",
    joinLink: "https://zoom.us/j/123456789",
    contactInfo: "contact@techsummit.com",
    totalSeats: 500,
    requiresApproval: true,
    startDate: "2025-09-15T09:00:00Z",
    endDate: "2025-09-17T18:00:00Z",
    organizerId: 1,
    companyId: 1,
    attachments: [
      { url: "/api/placeholder/800/400", type: "IMAGE" },
      { url: "/api/placeholder/800/400", type: "IMAGE" }
    ],
    organizer: { name: "Sarah Johnson", email: "sarah@company.com" },
    participants: 127,
    approved: 98,
    pending: 29,
    status: "ACTIVE"
  },
  {
    id: 2,
    title: "Digital Marketing Masterclass",
    description: "Learn advanced strategies for social media marketing, SEO optimization, and conversion rate optimization from industry experts.",
    type: "WORKSHOP",
    venue: null,
    joinLink: "https://meet.google.com/abc-defg-hij",
    contactInfo: "info@marketingclass.com",
    totalSeats: 50,
    requiresApproval: false,
    startDate: "2025-08-30T14:00:00Z",
    endDate: "2025-08-30T17:00:00Z",
    organizerId: 2,
    companyId: 1,
    attachments: [
      { url: "/api/placeholder/800/400", type: "IMAGE" }
    ],
    organizer: { name: "Mike Chen", email: "mike@company.com" },
    participants: 45,
    approved: 45,
    pending: 0,
    status: "ACTIVE"
  },
  {
    id: 3,
    title: "Startup Pitch Competition",
    description: "Emerging entrepreneurs present their innovative ideas to a panel of investors. Winner receives $100K funding and mentorship program.",
    type: "COMPETITION",
    venue: "Innovation Hub Auditorium",
    joinLink: null,
    contactInfo: "startups@innovationhub.com",
    totalSeats: 200,
    requiresApproval: true,
    startDate: "2025-09-22T19:00:00Z",
    endDate: "2025-09-22T22:00:00Z",
    organizerId: 1,
    companyId: 1,
    attachments: [
      { url: "/api/placeholder/800/400", type: "IMAGE" },
      { url: "/api/placeholder/800/400", type: "VIDEO" }
    ],
    organizer: { name: "Sarah Johnson", email: "sarah@company.com" },
    participants: 78,
    approved: 60,
    pending: 18,
    status: "DRAFT"
  }
];

type Visibility = "ONLINE" | "ONSITE";
type EventCategory = "CONFERENCE" | "WORKSHOP" | "SEMINAR" | "WEBINAR" | "COMPETITION";
type AttachmentType = "IMAGE" | "VIDEO";

type FormValues = {
  title: string;
  description: string;
  TypeOfEvent: EventCategory;     // Conference / Workshop / ...
  type: Visibility;               // ONLINE / ONSITE (EventVisibility)
  venue: string;
  joinLink: string;
  contactInfo: string;
  totalSeats: string;             // we’ll coerce to number | null on submit
  requiresApproval: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attachments: { url: string; type: AttachmentType }[];
  // UI helper: multiline string; we'll convert to array (JSON) on submit
  joinQuestionsText: string;
};


type EventType = {
  id: number;
  title: string;
  description: string;
  type: string;
  venue: string | null;
  joinLink: string | null;
  contactInfo: string;
  totalSeats: number | null;
  requiresApproval: boolean;
  startDate: string;
  endDate: string;
  organizerId: number;
  companyId: number;
  // attachments: { file: File }[] | { url: string; type: AttachmentType }[]; // for create: file upload; for edit: existing urls
  attachments: any; // for create: file upload; for edit: existing urls
  organizer: { name: string; email: string };
  participants: any;
  approved: number;
  pending: number;
  status: string;
};

const CreateEventModal = ({ isOpen, onClose, event = null, onSave }: CreateEventModalProps) => {
  const toast = useToast();


  const cardBg = useColorModeValue("gray.800", "gray.900");
  const inputBg = useColorModeValue("gray.700", "gray.800");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  // --- Validation schema
  const Schema = Yup.object({
    title: Yup.string().trim().min(3, "Title is too short").required("Title is required"),
    description: Yup.string().trim().min(10, "Please add more details").required("Description is required"),
    TypeOfEvent: Yup.mixed<EventCategory>().oneOf(["CONFERENCE", "WORKSHOP", "SEMINAR", "WEBINAR", "COMPETITION"]).required(),
    type: Yup.mixed<Visibility>().oneOf(["ONLINE", "ONSITE"]).required("Visibility is required"),
    // Conditional fields:
    venue: Yup.string().when("type", {
      is: "ONSITE",
      then: (s) => s.trim().min(3, "Venue is too short").required("Venue is required for onsite events"),
      otherwise: (s) => s.strip().optional(),
    }),
    joinLink: Yup.string().when("type", {
      is: "ONLINE",
      then: (s) =>
        s
          .trim()
          .url("Provide a valid URL (https://...)")
          .required("Join Link is required for online events"),
      otherwise: (s) => s.strip().optional(),
    }),
    contactInfo: Yup.string().trim().min(3).required("Contact info is required"),
    totalSeats: Yup.string()
      .matches(/^\d*$/, "Total seats must be a number")
      .test("nonNegative", "Total seats must be 0 or greater", (v) => (v ? parseInt(v, 10) >= 0 : true)),
    startDate: Yup.string().required("Start date is required"),
    startTime: Yup.string().required("Start time is required"),
    endDate: Yup.string()
      .required("End date is required")
      .test("endAfterStart", "End must be after start", function (value) {
        const { startDate, startTime, endTime } = this.parent as FormValues;
        if (!value || !startDate || !startTime || !endTime) return true;
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${value}T${endTime}`);
        return end > start;
      }),
    endTime: Yup.string().required("End time is required"),
    attachments: Yup.array()
      .of(
        Yup.object({
          // Remove file validation from schema since we handle it in UI
          type: Yup.mixed<AttachmentType>()
            .oneOf(["IMAGE", "VIDEO"])
            .required("Attachment type is required"),
          url: Yup.string().optional(), // For preview
          file: Yup.mixed<File>().optional(), // For actual file upload
        })
      )
      .test("hasFiles", "Please add at least one file", (value) => {
        return value && value.some((att: any) => att.file instanceof File);
      }),

    joinQuestionsText: Yup.string().max(2000, "Too long"),
    requiresApproval: Yup.boolean(),
  });

  // Initial values (supporting old event shape during transition)
  const initialValues: FormValues = {
    title: event?.title ?? "",
    description: event?.description ?? "",
    TypeOfEvent: (event as any)?.TypeOfEvent ?? (event?.type as EventCategory) ?? "CONFERENCE",
    type:
      // Infer ONLINE/ONSITE from fields if editing an older event
      (event?.joinLink ? "ONLINE" : "ONSITE") as Visibility,
    venue: event?.venue ?? "",
    joinLink: event?.joinLink ?? "",
    contactInfo: event?.contactInfo ?? "",
    totalSeats: event?.totalSeats != null ? String(event.totalSeats) : "",
    requiresApproval: Boolean(event?.requiresApproval),
    startDate: event ? new Date(event.startDate).toISOString().slice(0, 10) : "",
    endDate: event ? new Date(event.endDate).toISOString().slice(0, 10) : "",
    startTime: event ? new Date(event.startDate).toTimeString().slice(0, 5) : "",
    endTime: event ? new Date(event.endDate).toTimeString().slice(0, 5) : "",
    attachments:
      event?.attachments?.length
        ? event.attachments.map((a: any) => ({ url: a.url, type: (a.type as AttachmentType) ?? "IMAGE" }))
        : [{ url: "", type: "IMAGE" }],
    joinQuestionsText: "", // user can paste questions (one per line)
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={cardBg} border="1px" borderColor={borderColor} maxH="90vh">
        <ModalHeader>
          <HStack>
            <Box p={2} borderRadius="lg" bg="yellow.400" color="black">
              <FaPlus />
            </Box>
            <Heading size="lg" color="white">
              {event ? "Edit Event" : "Create New Event"}
            </Heading>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting }) => {
            console.log(values);
            try {
              const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
              const endDateTime = new Date(`${values.endDate}T${values.endTime}`);

              const joinQuestions = values.joinQuestionsText
                ? values.joinQuestionsText
                  .split("\n")
                  .map((q) => q.trim())
                  .filter(Boolean)
                : undefined;

              const payload = {
                title: values.title,
                description: values.description,
                // schema-aligned:
                type: values.type, // EventVisibility
                TypeOfEvent: values.TypeOfEvent, // EventType (Conference/Workshop/...)
                venue: values.type === "ONSITE" ? values.venue || null : null,
                joinLink: values.type === "ONLINE" ? values.joinLink || null : null,
                contactInfo: values.contactInfo,
                totalSeats: values.totalSeats ? parseInt(values.totalSeats, 10) : null,
                requiresApproval: values.requiresApproval,
                joinQuestions: joinQuestions?.length ? joinQuestions : undefined, // JSON[]
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                // attachments for backend create: [{url, type}]
                attachments: values.attachments,
              };

              await onSave(payload);
              onClose();
            } catch (err) {
              toast({
                title: "Something went wrong",
                description: "Please try again.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top",
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form id="eventForm">
              <ModalBody overflowY="auto" maxH="70vh">
                <VStack spacing={6} align="stretch">
                  {/* Title */}
                  <FormControl isRequired isInvalid={!!(touched.title && errors.title)}>
                    <FormLabel color="gray.300">Event Title</FormLabel>
                    <Input
                      name="title"
                      value={values.title}
                      onChange={(e) => setFieldValue("title", e.target.value)}
                      placeholder="Enter event title"
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: "yellow.400" }}
                      _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                    />
                    <FormErrorMessage>{errors.title as string}</FormErrorMessage>
                  </FormControl>

                  {/* Description */}
                  <FormControl isRequired isInvalid={!!(touched.description && errors.description)}>
                    <FormLabel color="gray.300">Description</FormLabel>
                    <Textarea
                      name="description"
                      value={values.description}
                      onChange={(e) => setFieldValue("description", e.target.value)}
                      placeholder="Describe your event..."
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: "yellow.400" }}
                      _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      rows={4}
                    />
                    <FormErrorMessage>{errors.description as string}</FormErrorMessage>
                  </FormControl>

                  {/* Category + Visibility */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl isRequired isInvalid={!!(touched.TypeOfEvent && errors.TypeOfEvent)}>
                      <FormLabel color="gray.300">Event Category</FormLabel>
                      <Select
                        name="TypeOfEvent"
                        value={values.TypeOfEvent}
                        onChange={(e) => setFieldValue("TypeOfEvent", e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                      >
                        <option value="CONFERENCE">Conference</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="WEBINAR">Webinar</option>
                        <option value="COMPETITION">Competition</option>
                      </Select>
                      <FormErrorMessage>{errors.TypeOfEvent as string}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!(touched.type && errors.type)}>
                      <FormLabel color="gray.300">Visibility</FormLabel>
                      <Select
                        name="type"
                        value={values.type}
                        onChange={(e) => {
                          const v = e.target.value as Visibility;
                          setFieldValue("type", v);
                          // reset the other field when switching
                          if (v === "ONLINE") setFieldValue("venue", "");
                          if (v === "ONSITE") setFieldValue("joinLink", "");
                        }}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                      >
                        <option value="ONSITE">Onsite</option>
                        <option value="ONLINE">Online</option>
                      </Select>
                      <FormErrorMessage>{errors.type as string}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  {/* Conditional: Venue / Join Link */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {values.type === "ONSITE" && (
                      <FormControl isRequired isInvalid={!!(touched.venue && errors.venue)}>
                        <FormLabel color="gray.300">Venue</FormLabel>
                        <Input
                          name="venue"
                          value={values.venue}
                          onChange={(e) => setFieldValue("venue", e.target.value)}
                          placeholder="Physical location"
                          bg={inputBg}
                          borderColor={borderColor}
                          _hover={{ borderColor: "yellow.400" }}
                          _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                        />
                        <FormErrorMessage>{errors.venue as string}</FormErrorMessage>
                      </FormControl>
                    )}

                    {values.type === "ONLINE" && (
                      <FormControl isRequired isInvalid={!!(touched.joinLink && errors.joinLink)}>
                        <FormLabel color="gray.300">Join Link</FormLabel>
                        <Input
                          name="joinLink"
                          value={values.joinLink}
                          onChange={(e) => setFieldValue("joinLink", e.target.value)}
                          placeholder="https://your-meeting-link"
                          bg={inputBg}
                          borderColor={borderColor}
                          _hover={{ borderColor: "yellow.400" }}
                          _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                        />
                        <FormErrorMessage>{errors.joinLink as string}</FormErrorMessage>
                      </FormControl>
                    )}

                    {/* Total Seats */}
                    <FormControl isInvalid={!!(touched.totalSeats && errors.totalSeats)}>
                      <FormLabel color="gray.300">Total Seats</FormLabel>
                      <NumberInput>
                        <NumberInputField
                          name="totalSeats"
                          value={values.totalSeats}
                          onChange={(e) => setFieldValue("totalSeats", e.target.value)}
                          placeholder="Unlimited"
                          bg={inputBg}
                          borderColor={borderColor}
                          _hover={{ borderColor: "yellow.400" }}
                          _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                        />
                      </NumberInput>
                      <FormErrorMessage>{errors.totalSeats as string}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  {/* Contact Info */}
                  <FormControl isRequired isInvalid={!!(touched.contactInfo && errors.contactInfo)}>
                    <FormLabel color="gray.300">Contact Information</FormLabel>
                    <Input
                      name="contactInfo"
                      value={values.contactInfo}
                      onChange={(e) => setFieldValue("contactInfo", e.target.value)}
                      placeholder="Email or phone number"
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: "yellow.400" }}
                      _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                    />
                    <FormErrorMessage>{errors.contactInfo as string}</FormErrorMessage>
                  </FormControl>

                  {/* Dates & Times */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl isRequired isInvalid={!!(touched.startDate && errors.startDate)}>
                      <FormLabel color="gray.300">Start Date</FormLabel>
                      <Input
                        type="date"
                        name="startDate"
                        value={values.startDate}
                        onChange={(e) => setFieldValue("startDate", e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                        _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      />
                      <FormErrorMessage>{errors.startDate as string}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!(touched.startTime && errors.startTime)}>
                      <FormLabel color="gray.300">Start Time</FormLabel>
                      <Input
                        type="time"
                        name="startTime"
                        value={values.startTime}
                        onChange={(e) => setFieldValue("startTime", e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                        _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      />
                      <FormErrorMessage>{errors.startTime as string}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl isRequired isInvalid={!!(touched.endDate && errors.endDate)}>
                      <FormLabel color="gray.300">End Date</FormLabel>
                      <Input
                        type="date"
                        name="endDate"
                        value={values.endDate}
                        onChange={(e) => setFieldValue("endDate", e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                        _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      />
                      <FormErrorMessage>{errors.endDate as string}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!(touched.endTime && errors.endTime)}>
                      <FormLabel color="gray.300">End Time</FormLabel>
                      <Input
                        type="time"
                        name="endTime"
                        value={values.endTime}
                        onChange={(e) => setFieldValue("endTime", e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: "yellow.400" }}
                        _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      />
                      <FormErrorMessage>{errors.endTime as string}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  {/* Requires Approval */}
                  <FormControl display="flex" alignItems="center">
                    <FormLabel color="gray.300" mb="0">
                      Requires Approval
                    </FormLabel>
                    <Switch
                      isChecked={values.requiresApproval}
                      onChange={(e) => setFieldValue("requiresApproval", e.target.checked)}
                      colorScheme="yellow"
                    />
                  </FormControl>

                  {/* Join Questions (optional) */}
                  <FormControl>
                    <FormLabel color="gray.300">Joining Questions (optional)</FormLabel>
                    <Textarea
                      name="joinQuestionsText"
                      value={values.joinQuestionsText}
                      onChange={(e) => setFieldValue("joinQuestionsText", e.target.value)}
                      placeholder={"One question per line\nE.g.\nWhat is your experience level?\nWhy do you want to join?"}
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: "yellow.400" }}
                      _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                      rows={3}
                    />
                  </FormControl>

                  {/* Attachments */}
                  <FormControl isRequired isInvalid={!!(touched.attachments && errors.attachments)}>
                    <FormLabel color="gray.300">Attachments (at least one)</FormLabel>

                    <FieldArray name="attachments">
                      {({ remove, push }) => (
                        <VStack align="stretch" spacing={3}>
                          {values.attachments.map((att, idx) => (
                            <HStack key={idx} spacing={3} align="start">
                              {/* Type selector */}
                              <Select
                                value={att.type}
                                onChange={(e) => setFieldValue(`attachments.${idx}.type`, e.target.value)}
                                bg={inputBg}
                                borderColor={borderColor}
                                _hover={{ borderColor: "yellow.400" }}
                                w="32%"
                              >
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                              </Select>

                              {/* File input */}
                              <Input
                                type="file"
                                accept={att.type === "IMAGE" ? "image/*" : "video/*"}
                                onChange={(e) => {
                                  console.log("🔹 File input changed:", e.target.files);
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  if (file.size > 5 * 1024 * 1024) {
                                    console.log("🔹 File too large:", file.size);
                                    toast({
                                      title: "File too large",
                                      description: "Maximum allowed size is 5MB.",
                                      status: "error",
                                      duration: 4000,
                                      isClosable: true,
                                      position: "top",
                                    });
                                    // Reset the file input
                                    e.target.value = '';
                                    return;
                                  }

                                  // Validate file type
                                  if (
                                    (att.type === "IMAGE" && !file.type.startsWith("image/")) ||
                                    (att.type === "VIDEO" && !file.type.startsWith("video/"))
                                  ) {
                                    toast({
                                      title: "Invalid file type",
                                      description: `Please select a ${att.type.toLowerCase()} file.`,
                                      status: "error",
                                      duration: 4000,
                                      isClosable: true,
                                      position: "top",
                                    });
                                    e.target.value = '';
                                    return;
                                  }

                                  // Store both file object and preview URL
                                  setFieldValue(`attachments.${idx}.file`, file);
                                  const previewUrl = URL.createObjectURL(file);
                                  setFieldValue(`attachments.${idx}.url`, previewUrl);

                                  console.log(`🔹 File ${idx} set:`, file.name, file.size, file.type);
                                }}
                              />

                              <IconButton
                                aria-label="Remove"
                                icon={<FaTrash />}
                                variant="ghost"
                                color="red.400"
                                onClick={() => remove(idx)}
                              />
                            </HStack>
                          ))}

                          <Button
                            leftIcon={<FaPlus />}
                            variant="outline"
                            borderColor="gray.600"
                            color="gray.300"
                            _hover={{ borderColor: "yellow.400", color: "yellow.400" }}
                            onClick={() => push({ url: "", type: "IMAGE" as AttachmentType })}
                            size="sm"
                            alignSelf="flex-start"
                          >
                            Add Attachment
                          </Button>
                        </VStack>
                      )}
                    </FieldArray>

                    <FormErrorMessage>
                      {typeof errors.attachments === "string" ? errors.attachments : undefined}
                    </FormErrorMessage>
                  </FormControl>

                </VStack>
              </ModalBody>

              <ModalFooter>
                <HStack spacing={3}>
                  <Button variant="ghost" onClick={onClose} color="gray.400">
                    Cancel
                  </Button>
                  <Button
                    colorScheme="yellow"
                    isLoading={isSubmitting}
                    loadingText={event ? "Updating..." : "Creating..."}
                    type="submit"
                    leftIcon={event ? <FaEdit /> : <FaPlus />}
                    form="eventForm"
                  >
                    {event ? "Update Event" : "Create Event"}
                  </Button>
                </HStack>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

const EventCard = ({
  event,
  onEdit,
  onDelete,
  onView
}: {
  event: EventType;
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
  onView: (event: EventType) => void;
  onDuplicate: (event: EventType) => void;
}) => {
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  const getEventTypeColor = (type: string) => {
    const colors = {
      CONFERENCE: "blue",
      WORKSHOP: "green",
      COMPETITION: "purple",
      SEMINAR: "orange",
      WEBINAR: "teal"
    };
    return colors[type as keyof typeof colors] || "gray";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "green",
      DRAFT: "yellow",
      COMPLETED: "gray",
      CANCELLED: "red"
    };
    return colors[status as keyof typeof colors] || "gray";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MotionCard
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="xl"
      position="relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      _hover={{
        borderColor: "yellow.400",
        shadow: "2xl"
      }}
    >
      <Box position="relative">
        {event.attachments?.[0] && (
          <Image
            src={
              event.attachments[0].url ||
              (event.attachments[0].file ? URL.createObjectURL(event.attachments[0].file) : undefined)
            }
            alt={event.title}
            h="200px"
            w="full"
            objectFit="cover"
            fallback={
              <Box
                h="200px"
                bg="gray.700"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaImage size="40px" color="#718096" />
              </Box>
            }
          />
        )}

        <Box
          position="absolute"
          top={3}
          left={3}
          zIndex={2}
        >
          <Badge colorScheme={getEventTypeColor(event.type)} size="sm" borderRadius="md">
            {event.type}
          </Badge>
        </Box>
        <Box
          position="absolute"
          top={3}
          right={3}
          zIndex={2}
        >
          <Badge colorScheme={getStatusColor(event.status)} size="sm" borderRadius="md">
            {event.status}
          </Badge>
        </Box>
        {event.attachments?.length > 1 && (
          <Box
            position="absolute"
            bottom={3}
            right={3}
            bg="blackAlpha.700"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
          >
            +{event.attachments.length - 1} more
          </Box>
        )}

      </Box>

      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          <Box>
            <Heading size="md" color="white" mb={2} noOfLines={2}>
              {event.title}
            </Heading>
            <Text color="gray.400" fontSize="sm" noOfLines={3}>
              {event.description}
            </Text>
          </Box>

          <VStack align="stretch" spacing={2}>
            <HStack color="gray.300" fontSize="sm">
              <FaCalendarAlt />
              <Text>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Text>
            </HStack>
            <HStack color="gray.300" fontSize="sm">
              <FaClock />
              <Text>
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </Text>
            </HStack>
            {event.venue && (
              <HStack color="gray.300" fontSize="sm">
                <FaMapMarkerAlt />
                <Text noOfLines={1}>{event.venue}</Text>
              </HStack>
            )}
            {event.joinLink && (
              <HStack color="gray.300" fontSize="sm">
                <FaLink />
                <Text>Online Event</Text>
              </HStack>
            )}
          </VStack>

          <Box
            p={3}
            bg="gray.700"
            borderRadius="lg"
            border="1px"
            borderColor="gray.600"
          >
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.300">Participants</Text>
              <Text fontSize="sm" color="yellow.400" fontWeight="bold">
                {event.participants}/{event.totalSeats || '∞'}
              </Text>
            </HStack>
            {event.totalSeats && (
              <Progress
                value={(event.participants / event.totalSeats) * 100}
                size="sm"
                colorScheme="yellow"
                borderRadius="full"
                bg="gray.600"
              />
            )}
            <HStack justify="space-between" mt={2} fontSize="xs" color="gray.400">
              <HStack>
                <FaCheck color="#48BB78" />
                <Text>
                  Approved:{" "}
                  {/* {event.participants?.filter((p: any) => p.status === "CONFIRMED").length || 0} */}
                </Text>
              </HStack>

              <HStack>
                <FaClock color="#ED8936" />
                <Text>
                  Pending:{" "}
                  {/* {event.participants?.filter((p: any) => p.status === "PENDING").length || 0} */}
                </Text>
              </HStack>
            </HStack>

          </Box>

          <HStack justify="space-between" align="center">
            <HStack>
              <Avatar size="sm" name={event.organizer.name} />
              <Text fontSize="sm" color="gray.300">{event.organizer.name}</Text>
            </HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                color="gray.400"
                size="sm"
                _hover={{ color: "yellow.400" }}
              />
              <MenuList bg="gray.800" borderColor="gray.600">
                <MenuItem
                  icon={<FaEye />}
                  onClick={() => onView(event)}
                  _hover={{ bg: "gray.700" }}
                >
                  View Details
                </MenuItem>
                <MenuItem
                  icon={<FaEdit />}
                  onClick={() => onEdit(event)}
                  _hover={{ bg: "gray.700" }}
                >
                  Edit Event
                </MenuItem>
                <MenuItem
                  icon={<FaUsers />}
                  _hover={{ bg: "gray.700" }}
                >
                  Manage Participants
                </MenuItem>
                <MenuItem
                  icon={<FaShare />}
                  _hover={{ bg: "gray.700" }}
                >
                  Share Event
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FaTrash />}
                  onClick={() => onDelete(event)}
                  color="red.400"
                  _hover={{ bg: "red.900" }}
                >
                  Delete Event
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event?: EventType | null;
  onSave: (eventData: any) => Promise<void>;
};



const AdminEventsDashboard = () => {

  const { user } = useUserStore();
  const { company } = useCompanyStore();
  const [events, setEvents] = useState(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);


  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const toast = useToast();


  const bg = useColorModeValue("gray.900", "black");
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");
  const inputBg = useColorModeValue("gray.700", "gray.800");

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(event => event.status === filterStatus);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, filterType, filterStatus]);

  useEffect(() => {
    if (company?.events) {
      setEvents(company.events);
      setFilteredEvents(company.events);
    }
  }, [company]);


  const handleCreateEvent = async (eventData: any) => {
    console.log("🔥 handleCreateEvent called with:", eventData);
    try {
      const formData = new FormData();

      // Extract attachments first
      const { attachments, ...rest } = eventData;


      // Append all non-file fields directly
      Object.entries({
        ...rest,
        companyId: company?.id,
        organizerId: user.user.profileId,
        status: "DRAFT",
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // For objects/arrays, stringify them
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Append files with proper field names
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment: any, index: number) => {

          if (attachment && attachment.file instanceof File) {
            console.log(`Appending file ${index}:`, attachment.file.name, attachment.file.size);
            // Use consistent field name that backend expects
            formData.append("files", attachment.file);
            // Also append type information if needed
            formData.append("fileTypes", attachment.type);
          }
        });
      }

      // Debug: Log FormData contents
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Send request
      const res = await apiFormData().post("/events", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Update UI
      setEvents([res.data, ...events]);

      toast({
        title: "Event created successfully! 🎉",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error("Error creating event:", err.response?.data || err.message);
      toast({
        title: "Failed to create event",
        description: err.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleEditEvent = async (eventData: EventType) => {
    if (selectedEvent) {
      setEvents(events.map(event =>
        event.id === selectedEvent.id
          ? {
            ...event,
            ...eventData,
            venue: eventData.venue ?? "",
            joinLink: eventData.joinLink ?? "",
            totalSeats: eventData.totalSeats ?? 0
          }
          : event
      ));
      setSelectedEvent(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setSelectedEvent(null);
      toast({
        title: "Event deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewEvent = (event: EventType) => {
    toast({
      title: "Event Details",
      description: `Viewing details for: ${event.title}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const openEditModal = (event: EventType) => {
    setSelectedEvent(event);
    onEditModalOpen();
  };

  const openDeleteModal = (event: EventType) => {
    setSelectedEvent(event);
    onDeleteModalOpen();
  };

  const refreshEvents = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Events refreshed successfully! 🔄",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setIsLoading(false);
    }, 1000);
  };

  // Statistics
  const totalEvents = events.length;
  // Total participants across ALL events
  // Total participants across ALL events
  const totalParticipants =
    events?.reduce((sum, event) => sum + (Array.isArray(event.participants) ? event.participants.length : 0), 0) || 0;

  // Count of ACTIVE events
  const activeEvents =
    events?.filter(event => event.status === "ACTIVE").length || 0;

  // Pending approvals across ALL events
  const pendingApprovals =
    events?.reduce((sum, event) => {
      const pendingCount = Array.isArray(event.participants)
        ? event.participants.filter(p => p.status === "PENDING").length
        : 0;
      return sum + pendingCount;
    }, 0) || 0;



  return (
    <Box bg={bg} minH="100vh" color="white">
      <Header />
      <Container maxW={{ sm: "100%", md: "90%" }} py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <MotionBox
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <Heading
                  size="2xl"
                  bgGradient="linear(to-r, yellow.400, yellow.600)"
                  bgClip="text"
                >
                  Events Dashboard ✨
                </Heading>
                <Text color="gray.400" fontSize="lg">
                  Manage and track your amazing events
                </Text>
              </VStack>
              <HStack spacing={3}>
                <IconButton
                  icon={<BiRefresh />}
                  aria-label="Refresh events"
                  colorScheme="gray"
                  variant="outline"
                  isLoading={isLoading}
                  onClick={refreshEvents}
                  _hover={{ borderColor: "yellow.400", color: "yellow.400" }}
                />
                <MotionButton
                  leftIcon={<FaPlus />}
                  colorScheme="yellow"
                  size="lg"
                  onClick={onCreateModalOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  shadow="lg"
                  _hover={{
                    shadow: "xl",
                    transform: "translateY(-2px)"
                  }}
                >
                  Create Event
                </MotionButton>
              </HStack>
            </Flex>
          </MotionBox>

          {/* Statistics Cards */}
          <MotionBox
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <StatLabel color="gray.400">Total Events</StatLabel>
                        <StatNumber color="white" fontSize="2xl">{totalEvents}</StatNumber>
                        <StatHelpText color="green.400">
                          <StatArrow type="increase" />
                          23.36%
                        </StatHelpText>
                      </Box>
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="blue.500"
                        color="white"
                      >
                        <FaCalendarAlt size="24px" />
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <StatLabel color="gray.400">Total Participants</StatLabel>
                        <StatNumber color="white" fontSize="2xl">{Number(totalParticipants)}</StatNumber>
                        <StatHelpText color="green.400">
                          <StatArrow type="increase" />
                          18.25%
                        </StatHelpText>
                      </Box>
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="green.500"
                        color="white"
                      >
                        <FaUsers size="24px" />
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <StatLabel color="gray.400">Active Events</StatLabel>
                        <StatNumber color="white" fontSize="2xl">{activeEvents}</StatNumber>
                        <StatHelpText color="yellow.400">
                          <FaRocket />
                          Live now
                        </StatHelpText>
                      </Box>
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="yellow.500"
                        color="black"
                      >
                        <FaRocket size="24px" />
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <StatLabel color="gray.400">Pending Approvals</StatLabel>
                        <StatNumber color="white" fontSize="2xl">{pendingApprovals}</StatNumber>
                        <StatHelpText color="orange.400">
                          <FaClock />
                          Needs review
                        </StatHelpText>
                      </Box>
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="orange.500"
                        color="white"
                      >
                        <FaClock size="24px" />
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>
          </MotionBox>

          {/* Search and Filters */}
          <MotionBox
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={6}>
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4} alignItems="end">
                <FormControl>
                  <FormLabel color="gray.300" fontSize="sm">Search Events</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="#718096" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by title, description, or organizer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: "yellow.400" }}
                      _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300" fontSize="sm">Event Type</FormLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    bg={inputBg}
                    borderColor={borderColor}
                    _hover={{ borderColor: "yellow.400" }}
                  >
                    <option value="ALL">All Types</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="WEBINAR">Webinar</option>
                    <option value="COMPETITION">Competition</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300" fontSize="sm">Status</FormLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    bg={inputBg}
                    borderColor={borderColor}
                    _hover={{ borderColor: "yellow.400" }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </FormControl>
              </Grid>

              {(searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL') && (
                <HStack mt={4} spacing={2}>
                  <Text fontSize="sm" color="gray.400">Active filters:</Text>
                  {searchQuery && (
                    <Badge colorScheme="yellow" borderRadius="full">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  {filterType !== 'ALL' && (
                    <Badge colorScheme="blue" borderRadius="full">
                      Type: {filterType}
                    </Badge>
                  )}
                  {filterStatus !== 'ALL' && (
                    <Badge colorScheme="green" borderRadius="full">
                      Status: {filterStatus}
                    </Badge>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    color="gray.400"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('ALL');
                      setFilterStatus('ALL');
                    }}
                  >
                    Clear all
                  </Button>
                </HStack>
              )}
            </Card>
          </MotionBox>

          {/* Events Grid */}
          <MotionBox
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {filteredEvents.length === 0 ? (
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={12} >
                <VStack spacing={6}>
                  <Box
                    p={6}
                    borderRadius="full"
                    bg="gray.700"
                    color="gray.400"

                  >
                    <FaCalendarAlt size="48px" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="gray.400">
                      {searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL'
                        ? "No events match your filters"
                        : "No events created yet"
                      }
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      {searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL'
                        ? "Try adjusting your search criteria or filters to find events."
                        : "Create your first event to get started with event management."
                      }
                    </Text>
                  </VStack>
                  {!(searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL') && (
                    <Button
                      leftIcon={<FaPlus />}
                      colorScheme="yellow"
                      size="lg"
                      onClick={onCreateModalOpen}
                    >
                      Create Your First Event
                    </Button>
                  )}
                </VStack>
              </Card>
            ) : (
              <>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text color="gray.300">
                    Showing {filteredEvents.length} of {events.length} events
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.400">Sort by:</Text>
                    <Select size="sm" bg={inputBg} borderColor={borderColor} w="auto">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                      <option value="participants">Most Participants</option>
                      <option value="date">Event Date</option>
                    </Select>
                  </HStack>
                </Flex>

                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)"
                  }}
                  gap={6}

                >
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <MotionBox
                        key={event.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <EventCard
                          event={event}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          onView={handleViewEvent}
                          onDuplicate={(event) => {
                            toast({
                              title: "Event duplicated",
                              description: `Created a copy of "${event.title}"`,
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            });
                          }}
                        />
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </Grid>
              </>
            )}
          </MotionBox>
          <TeamMembersSection
            company={company}
            user={user}
          />
        </VStack>
      </Container>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSave={handleCreateEvent}
      />

      {/* Edit Event Modal */}
      <CreateEventModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        event={selectedEvent}
        onSave={handleEditEvent}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg={cardBg} border="1px" borderColor={borderColor}>
          <ModalHeader>
            <HStack>
              <Box
                p={2}
                borderRadius="lg"
                bg="red.500"
                color="white"
              >
                <FaExclamationTriangle />
              </Box>
              <Heading size="md" color="white">Delete Event</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody >
            <Alert status="warning" bg="red.900" border="1px" borderColor="red.600" borderRadius="lg">
              <AlertIcon color="red.400" />
              <Box>
                <AlertTitle color="red.200">Are you sure?</AlertTitle>
                <AlertDescription color="red.300">
                  This will permanently delete "{selectedEvent?.title}" and all associated data.
                  This action cannot be undone.
                </AlertDescription>
              </Box>
            </Alert>
            {(selectedEvent && typeof selectedEvent.participants === "number" && selectedEvent.participants > 0) && (
              <Alert status="error" bg="red.900" border="1px" borderColor="red.600" borderRadius="lg" mt={4}>
                <AlertIcon color="red.400" />
                <Box>
                  <AlertTitle color="red.200">Event has participants!</AlertTitle>
                  <AlertDescription color="red.300">
                    This event has {selectedEvent.participants} registered participants.
                    Consider canceling the event instead of deleting it.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onDeleteModalClose} color="gray.400">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  handleDeleteEvent();
                  onDeleteModalClose();
                }}
                leftIcon={<FaTrash />}
              >
                Delete Event
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminEventsDashboard;