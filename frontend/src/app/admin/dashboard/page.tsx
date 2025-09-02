"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  FormErrorMessage,
  RadioGroup,
  Radio,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Spinner,
  Center,
  Tooltip
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
  FaCheckCircle,
  FaHourglassHalf,
  FaUser
} from 'react-icons/fa';
import { BiRefresh } from 'react-icons/bi';
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { api, apiFormData } from "@/utils/Functions/helperApi";
import { useUserStore } from "@/utils/stores/useUserStore";
import { useCompanyStore } from '@/utils/stores/useCompanyStore';
import Header from '@/components/layout/Header';
import TeamMembersSection from '@/components/dashboard/TeamMembersSection';
import { refreshCompany } from '@/utils/stores/RefreshStore/refreshCompany';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

// Types
type Visibility = "ONLINE" | "ONSITE";
type EventCategory = "CONFERENCE" | "WORKSHOP" | "SEMINAR" | "WEBINAR" | "COMPETITION" | "OTHER";
type AttachmentType = "IMAGE" | "VIDEO";
type StatusType = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
type ParticipationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

type Event = {
  id: number;
  title: string;
  description: string;
  type: Visibility;
  venue?: string;
  joinLink?: string;
  contactInfo: string;
  totalSeats?: number;
  requiresApproval: boolean;
  startDate: string;
  endDate: string;
  organizerId: number;
  companyId: number;
  joinQuestions?: string[] | string; // Add this line
  attachments: Array<{
    id: number;
    url: string;
    type: AttachmentType;
    publicId?: string;
    file?: any;
  }>;
  organizer: {
    id: number;
    name: string;
  };
  company: {
    id: number;
    name: string;
  };
  confirmedParticipants: number;
  TypeOfEvent: EventCategory;
  status: StatusType;
  _count?: {
    participants: number;
  };
  participants: any;
};

type Participant = {
  id: number;
  eventId: number;
  participantId: number;
  status: ParticipationStatus;
  answers: Record<string, any>;
  joinedAt: string;
  participant: {
    id: number;
    name: string;
    user: {
      id: number;
      email: string;
    };
  };
};

type FormAttachment = {
  url: string;
  type: AttachmentType;
  file?: File;          // new uploads
  id?: number;          // existing from DB
  publicId?: string;    // existing from DB
};

type FormValues = {
  title: string;
  description: string;
  TypeOfEvent: EventCategory;
  type: Visibility;
  venue: string;
  joinLink: string;
  contactInfo: string;
  totalSeats: string;
  requiresApproval: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attachments: FormAttachment[];
  joinQuestionsText: string;
  status: StatusType;
};


const CreateEventModal = ({ isOpen, onClose, event = null, onSave }: CreateEventModalProps) => {
  const toast = useToast();
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const inputBg = useColorModeValue("gray.700", "gray.800");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  // Get today's date in YYYY-MM-DD format for minimum date validation
  const today = new Date().toISOString().split('T')[0];

  // Validation schema
  const Schema = Yup.object({
    title: Yup.string().trim().min(3, "Title is too short").required("Title is required"),
    description: Yup.string().trim().min(10, "Please add more details").required("Description is required"),
    TypeOfEvent: Yup.mixed<EventCategory>().oneOf(["CONFERENCE", "WORKSHOP", "SEMINAR", "WEBINAR", "COMPETITION", "OTHER"]).required(),
    type: Yup.mixed<Visibility>().oneOf(["ONLINE", "ONSITE"]).required("Visibility is required"),
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
    startDate: Yup.string()
      .required("Start date is required")
      .test("notPastDate", "Start date cannot be in the past", function (value) {
        // Only validate for new events, not for editing existing events
        if (event || !value) return true;
        return value >= today;
      }),
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
          type: Yup.mixed<AttachmentType>()
            .oneOf(["IMAGE", "VIDEO"])
            .required("Attachment type is required"),
          url: Yup.string().optional(),
          file: Yup.mixed<File>().optional(),  // ✅
          publicId: Yup.string().optional(),
          id: Yup.number().optional(),
        })
      )
      .test("hasFiles", "Please add at least one file", (value) => {
        return value && value.some((att: any) =>
          att.file instanceof File || (att.url && att.id) // Existing attachment has id and url
        );
      }),
    joinQuestionsText: Yup.string().max(2000, "Too long"),
    requiresApproval: Yup.boolean(),
    status: Yup.mixed<StatusType>().oneOf(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).required(),
  });

  // Parse join questions from existing event
  const parseJoinQuestions = (event: Event | null) => {
    if (!event) return "";

    // Check if joinQuestions exists and handle different formats
    if (event.joinQuestions) {
      if (Array.isArray(event.joinQuestions)) {
        return event.joinQuestions.join("\n");
      }
      if (typeof event.joinQuestions === 'string') {
        return event.joinQuestions;
      }
    }
    return "";
  };

  // Initial values
  const initialValues: FormValues = {
    title: event?.title ?? "",
    description: event?.description ?? "",
    TypeOfEvent: event?.TypeOfEvent ?? "CONFERENCE",
    type: event?.type ?? (event?.joinLink ? "ONLINE" : "ONSITE"),
    venue: event?.venue ?? "",
    joinLink: event?.joinLink ?? "",
    contactInfo: event?.contactInfo ?? "",
    totalSeats: event?.totalSeats != null ? String(event.totalSeats) : "",
    requiresApproval: Boolean(event?.requiresApproval),
    startDate: event ? new Date(event.startDate).toISOString().slice(0, 10) : "",
    endDate: event ? new Date(event.endDate).toISOString().slice(0, 10) : "",
    startTime: event ? new Date(event.startDate).toTimeString().slice(0, 5) : "",
    endTime: event ? new Date(event.endDate).toTimeString().slice(0, 5) : "",
    attachments: event?.attachments?.length
      ? [
        ...event.attachments.map((a) => ({
          url: a.url,
          type: a.type,
          publicId: a.publicId,
          id: a.id,
          file: undefined // ✅ never null
        })),
        { url: "", type: "IMAGE", file: undefined }
      ]
      : [{ url: "", type: "IMAGE", file: undefined }],
    joinQuestionsText: parseJoinQuestions(event),
    status: event?.status ?? "DRAFT",
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
            try {
              const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
              const endDateTime = new Date(`${values.endDate}T${values.endTime}`);

              const joinQuestions = values.joinQuestionsText
                ? values.joinQuestionsText
                  .split("\n")
                  .map((q) => q.trim())
                  .filter(Boolean)
                : undefined;

              // Separate existing and new attachments
              const existingAttachments = values.attachments.filter(att => att.id && att.url);
              const newAttachments = values.attachments.filter(att => att.file instanceof File);


              const payload = {
                title: values.title,
                description: values.description,
                type: values.type,
                TypeOfEvent: values.TypeOfEvent,
                venue: values.type === "ONSITE" ? values.venue || null : null,
                joinLink: values.type === "ONLINE" ? values.joinLink || null : null,
                contactInfo: values.contactInfo,
                totalSeats: values.totalSeats ? parseInt(values.totalSeats, 10) : null,
                requiresApproval: values.requiresApproval,
                joinQuestions: joinQuestions?.length ? joinQuestions : undefined,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                attachments: newAttachments, // Only new files for FormData
                existingAttachments: existingAttachments.map(att => ({
                  id: att.id,
                  url: att.url,
                  type: att.type,
                  publicId: att.publicId
                })), // Existing attachments to keep
                status: values.status,
              };

              await onSave(payload, event?.id);
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
                        <option value="OTHER">Other</option>
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
                        min={event ? undefined : today} // Only restrict for new events
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
                        min={values.startDate || (event ? undefined : today)}
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
                  <FormControl isInvalid={!!(touched.joinQuestionsText && errors.joinQuestionsText)}>
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
                    <FormErrorMessage>{errors.joinQuestionsText as string}</FormErrorMessage>
                  </FormControl>

                  {/* Attachments */}
                  <FormControl isRequired isInvalid={!!(touched.attachments && errors.attachments)}>
                    <FormLabel color="gray.300">Attachments (at least one)</FormLabel>

                    <FieldArray name="attachments">
                      {({ remove, push }) => (
                        <VStack align="stretch" spacing={3}>
                          {values.attachments.map((att, idx) => {
                            const isExisting = Boolean(att.id && att.url && !att.file);

                            return (
                              <Card key={idx} bg="gray.700" border="1px" borderColor={borderColor} p={4}>
                                <VStack spacing={3} align="stretch">
                                  <HStack spacing={3} align="start">
                                    {/* Type selector */}
                                    <Select
                                      value={att.type}
                                      onChange={(e) => setFieldValue(`attachments.${idx}.type`, e.target.value)}
                                      bg={inputBg}
                                      borderColor={borderColor}
                                      _hover={{ borderColor: "yellow.400" }}
                                      w="32%"
                                      isDisabled={isExisting} // Don't allow changing type of existing attachments
                                    >
                                      <option value="IMAGE">Image</option>
                                      <option value="VIDEO">Video</option>
                                    </Select>

                                    {/* File input for new attachments */}
                                    {!isExisting && (
                                      <Input
                                        type="file"
                                        accept={att.type === "IMAGE" ? "image/*" : "video/*"}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;

                                          if (file.size > 5 * 1024 * 1024) {
                                            toast({
                                              title: "File too large",
                                              description: "Maximum allowed size is 5MB.",
                                              status: "error",
                                              duration: 4000,
                                              isClosable: true,
                                              position: "top",
                                            });
                                            e.target.value = '';
                                            return;
                                          }

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

                                          setFieldValue(`attachments.${idx}.file`, file);
                                          const previewUrl = URL.createObjectURL(file);
                                          setFieldValue(`attachments.${idx}.url`, previewUrl);
                                          // Remove id to mark as new
                                          setFieldValue(`attachments.${idx}.id`, undefined);
                                        }}
                                      />
                                    )}

                                    <IconButton
                                      aria-label="Remove"
                                      icon={<FaTrash />}
                                      variant="ghost"
                                      color="red.400"
                                      onClick={() => remove(idx)}
                                      _hover={{ bg: "red.900" }}
                                    />
                                  </HStack>

                                  {/* Preview existing attachments */}
                                  {isExisting && (
                                    <Box>
                                      <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.400">
                                          Existing {att.type.toLowerCase()}
                                        </Text>
                                        <Badge colorScheme="green" size="sm">
                                          Saved
                                        </Badge>
                                      </HStack>
                                      {att.type === "IMAGE" ? (
                                        <Image
                                          src={att.url}
                                          alt="Existing attachment"
                                          maxH="150px"
                                          w="full"
                                          objectFit="cover"
                                          borderRadius="md"
                                          border="1px"
                                          borderColor={borderColor}
                                        />
                                      ) : (
                                        <Box
                                          p={4}
                                          bg="gray.600"
                                          borderRadius="md"
                                          border="1px"
                                          borderColor={borderColor}
                                          textAlign="center"
                                        >
                                          <VStack spacing={2}>
                                            <FaVideo size="24px" color="#718096" />
                                            <Text fontSize="sm" color="gray.400">
                                              Video attachment
                                            </Text>
                                          </VStack>
                                        </Box>
                                      )}
                                    </Box>
                                  )}

                                  {/* Preview new file uploads */}
                                  {!isExisting && att.url && att.file && (
                                    <Box>
                                      <Text fontSize="sm" color="gray.400" mb={2}>
                                        Preview:
                                      </Text>
                                      {att.type === "IMAGE" ? (
                                        <Image
                                          src={att.url}
                                          alt="Preview"
                                          maxH="150px"
                                          w="full"
                                          objectFit="cover"
                                          borderRadius="md"
                                          border="1px"
                                          borderColor={borderColor}
                                        />
                                      ) : (
                                        <Box
                                          p={4}
                                          bg="gray.600"
                                          borderRadius="md"
                                          border="1px"
                                          borderColor={borderColor}
                                          textAlign="center"
                                        >
                                          <VStack spacing={2}>
                                            <FaVideo size="24px" color="#718096" />
                                            <Text fontSize="sm" color="gray.400">
                                              {att.file?.name}
                                            </Text>
                                          </VStack>
                                        </Box>
                                      )}
                                    </Box>
                                  )}

                                  {/* Show empty state for new attachment slots */}
                                  {!isExisting && !att.file && (
                                    <Box
                                      p={6}
                                      border="2px dashed"
                                      borderColor="gray.600"
                                      borderRadius="md"
                                      textAlign="center"
                                    >
                                      <VStack spacing={2}>
                                        <Box color="gray.500">
                                          {att.type === "IMAGE" ? <FaImage size="24px" /> : <FaVideo size="24px" />}
                                        </Box>
                                        <Text fontSize="sm" color="gray.500">
                                          No {att.type.toLowerCase()} selected
                                        </Text>
                                      </VStack>
                                    </Box>
                                  )}
                                </VStack>
                              </Card>
                            );
                          })}

                          {/* ✅ New Add Button with limit + counter */}
                          <HStack spacing={3} align="center">
                            <Tooltip
                              label="Maximum 6 attachments allowed"
                              isDisabled={values.attachments.length < 6}
                            >
                              <Button
                                leftIcon={<FaPlus />}
                                variant="outline"
                                borderColor="gray.600"
                                color="gray.300"
                                _hover={{ borderColor: "yellow.400", color: "yellow.400" }}
                                onClick={() =>
                                  push({ url: "", type: "IMAGE" as AttachmentType, file: undefined, id: undefined })
                                }
                                size="sm"
                                alignSelf="flex-start"
                                isDisabled={values.attachments.length >= 6}
                              >
                                Add New Attachment
                              </Button>
                            </Tooltip>

                            <Text fontSize="sm" color={values.attachments.length >= 6 ? "red.400" : "gray.400"}>
                              {values.attachments.length} / 6 attachments
                            </Text>
                          </HStack>
                        </VStack>
                      )}
                    </FieldArray>


                    <FormErrorMessage>
                      {typeof errors.attachments === "string" ? errors.attachments : undefined}
                    </FormErrorMessage>
                  </FormControl>

                  {/* Status Selection */}
                  <FormControl isRequired isInvalid={!!(touched.status && errors.status)}>
                    <FormLabel color="gray.300">Event Status</FormLabel>
                    <RadioGroup
                      value={values.status}
                      onChange={(val) => setFieldValue("status", val)}
                    >
                      <HStack spacing={6}>
                        <Radio value="DRAFT" colorScheme="yellow">
                          Draft
                        </Radio>
                        <Radio value="ACTIVE" colorScheme="green">
                          Active
                        </Radio>
                        <Radio value="COMPLETED" colorScheme="blue">
                          Completed
                        </Radio>
                        <Radio value="CANCELLED" colorScheme="red">
                          Cancelled
                        </Radio>
                      </HStack>
                    </RadioGroup>
                    <FormErrorMessage>{errors.status as string}</FormErrorMessage>
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
  onView,
  onManageParticipants
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onView: (event: Event) => void;
  onManageParticipants: (event: Event) => void;
}) => {
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  const getEventTypeColor = (type: string) => {
    const colors = {
      CONFERENCE: "blue",
      WORKSHOP: "green",
      COMPETITION: "purple",
      SEMINAR: "orange",
      WEBINAR: "teal",
      OTHER: "gray"
    };
    return colors[type as keyof typeof colors] || "gray";
  };



  const getStatusColor = (status: StatusType) => {
    const colors: Record<StatusType, string> = {
      ACTIVE: "green",
      DRAFT: "yellow",
      COMPLETED: "gray",
      CANCELLED: "red",
    };

    return colors[status];
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
      h="100%"
      _hover={{
        borderColor: "yellow.400",
        shadow: "2xl"
      }}
    >
      <Box position="relative">
        {event.attachments?.[0] && (
          <>
            {event.attachments[0].type === "VIDEO" ? (
              <Box h="200px" w="full" bg="black">
                <video
                  src={event.attachments[0].url}
                  controls
                  style={{
                    height: "200px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            ) : (
              <Image
                src={event.attachments[0].url}
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
          </>
        )}

        <Box position="absolute" top={3} left={3} zIndex={2}>
          <Badge colorScheme={getEventTypeColor(event.TypeOfEvent)} size="sm" borderRadius="md">
            {event.TypeOfEvent}
          </Badge>
        </Box>
        <Box position="absolute" top={3} right={3} zIndex={2}>
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


      <CardBody display="flex" flexDirection="column" h="100%">
        <VStack align="stretch" spacing={4}>
          {/* Title + Description */}
          <Box>
            <Heading size="md" color="white" mb={2} noOfLines={2}>
              {event.title}
            </Heading>
            <Text color="gray.400" fontSize="sm" noOfLines={3}>
              {event.description}
            </Text>
          </Box>

          {/* Date, Time, Venue, JoinLink */}
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

          {/* Participants Box */}
          <Box
            p={3}
            bg="gray.700"
            borderRadius="lg"
            border="1px"
            borderColor="gray.600"
          >
            {(() => {
              const confirmed = event.participants?.filter(
                (p: any) => p.status === "CONFIRMED"
              ).length || 0;
              const totalSeats = event.totalSeats || null;

              return (
                <>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.300">
                      Participants
                    </Text>
                    <Text fontSize="sm" color="yellow.400" fontWeight="bold">
                      {confirmed}/{totalSeats || "∞"}
                    </Text>
                  </HStack>
                  {totalSeats && (
                    <Progress
                      value={(confirmed / totalSeats) * 100}
                      size="sm"
                      colorScheme="yellow"
                      borderRadius="full"
                      bg="gray.600"
                    />
                  )}
                </>
              );
            })()}

            <HStack justify="space-between" mt={2} fontSize="xs" color="gray.400">
              {/* Organizer */}
              <Text>by {event.organizer?.name}</Text>

              {/* Pending Approvals */}
              {event.requiresApproval && (
                <Text fontWeight="bold" color="red.400">
                  {
                    event.participants?.filter((p:Participant) => p.status === "PENDING").length || 0
                  } Pending Approval
                  {event.participants?.filter((p:Participant) => p.status === "PENDING").length !== 1 ? "s" : ""}
                </Text>
              )}
            </HStack>

          </Box>

          {/* Organizer + Menu */}
          <HStack justify="space-between" align="center">
            <HStack>
              <Avatar size="sm" name={event.organizer?.name} />
              <Text fontSize="sm" color="gray.300">
                {event.organizer?.name}
              </Text>
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
                  onClick={() => onManageParticipants(event)}
                  _hover={{ bg: "gray.700" }}
                >
                  Manage Participants
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

const ParticipantsModal = ({ isOpen, onClose, event }: { isOpen: boolean; onClose: () => void; event: Event | null }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  useEffect(() => {
    if (isOpen && event) {
      fetchParticipants();
    }
  }, [isOpen, event]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await api().get(`/events/${event?.id}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      toast({
        title: "Error",
        description: "Failed to load participants",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveParticipant = async (participantId: number) => {
    try {
      await api().post(`/events/${event?.id}/participants/${participantId}/approve`);
      toast({
        title: "Success",
        description: "Participant approved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await refreshCompany();
      fetchParticipants(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve participant:', error);
      toast({
        title: "Error",
        description: "Failed to approve participant",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'green';
      case 'PENDING': return 'orange';
      case 'REJECTED': return 'red';
      case 'CANCELLED': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return FaCheckCircle;
      case 'PENDING': return FaHourglassHalf;
      case 'REJECTED': return FaTimes;
      case 'CANCELLED': return FaTimes;
      default: return FaUser;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={cardBg} border="1px" borderColor={borderColor} maxH="80vh">
        <ModalHeader>
          <HStack>
            <Box p={2} borderRadius="lg" bg="blue.400" color="white">
              <FaUsers />
            </Box>
            <Heading size="lg" color="white">
              Participants for {event?.title}
            </Heading>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody overflowY="auto">
          {loading ? (
            <Center py={8}>
              <Spinner size="xl" color="yellow.400" />
            </Center>
          ) : participants.length === 0 ? (
            <Center py={8}>
              <VStack spacing={4}>
                <FaUsers size="48px" color="#718096" />
                <Text color="gray.400">No participants yet</Text>
              </VStack>
            </Center>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="gray.300">Participant</Th>
                    <Th color="gray.300">Email</Th>
                    <Th color="gray.300">Status</Th>
                    <Th color="gray.300">Joined At</Th>
                    <Th color="gray.300">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {participants.map((participant) => (
                    <Tr key={participant.id}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={participant.participant.name} />
                          <Text color="white">{participant.participant.name}</Text>
                        </HStack>
                      </Td>
                      <Td color="gray.300">{participant.participant.user.email}</Td>
                      <Td>
                        <Tag colorScheme={getStatusColor(participant.status)} size="sm">
                          <TagLeftIcon as={getStatusIcon(participant.status)} />
                          <TagLabel>{participant.status}</TagLabel>
                        </Tag>
                      </Td>
                      <Td color="gray.300">
                        {new Date(participant.joinedAt).toLocaleDateString()}
                      </Td>
                      <Td>
                        {participant.status === 'PENDING' && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FaCheck />}
                            onClick={() => handleApproveParticipant(participant.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} color="gray.400">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSave: (eventData: any, eventId?: number) => Promise<void>;
};

const AdminEventsDashboard = () => {
  const { user } = useUserStore();
  const { company } = useCompanyStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router=useRouter();

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isParticipantsModalOpen, onOpen: onParticipantsModalOpen, onClose: onParticipantsModalClose } = useDisclosure();

  const toast = useToast();
  const bg = useColorModeValue("gray.900", "black");
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");
  const inputBg = useColorModeValue("gray.700", "gray.800");

  useEffect(() => {
    fetchEvents();
  }, [company]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType, filterStatus]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      if (company?.events) {
        const startIndex = (page - 1) * 12;
        const paginated = company.events.slice(startIndex, startIndex + 12);

        setEvents(paginated);
        setTotalPages(Math.ceil(company.events.length / 12));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(event => event.TypeOfEvent === filterType);
    }
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(event => event.status === filterStatus);
    }


    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const formData = new FormData();


      // Extract attachments first
      const { attachments, ...rest } = eventData;

      // Append all non-file fields
      Object.entries({
        ...rest,
        companyId: company?.id,
        organizerId: user?.user?.profileId,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Append files
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment: any) => {
          if (attachment && attachment.file instanceof File) {
            formData.append("files", attachment.file);
            formData.append("fileTypes", attachment.type);
          }
        });
      }

      const res = await apiFormData().post("/events", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      await refreshCompany();
      

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
        description: err.response?.data?.error || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleEditEvent = async (eventData: any, eventId?: number) => {
    if (!eventId) return;

    try {
      const formData = new FormData();

      // Extract attachments first
      const { attachments, ...rest } = eventData;
      Object.entries({
        ...rest,
        companyId: company?.id,
        organizerId: user?.user?.profileId,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Append files
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment: any) => {
          if (attachment && attachment.file instanceof File) {
            formData.append("files", attachment.file);
            formData.append("fileTypes", attachment.type);
          }
        });
      }
      // Append all non-file fields
      const response = await apiFormData().patch(`/events/${eventId}`, formData);
      setEvents(events.map(event => event.id === eventId ? response.data : event));

      await refreshCompany();

      toast({
        title: "Event updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error("Error updating event:", err.response?.data || err.message);
      toast({
        title: "Failed to update event",
        description: err.response?.data?.error || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await api().delete(`/events/${selectedEvent.id}`);
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      await refreshCompany();

      toast({
        title: "Event deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error("Error deleting event:", err.response?.data || err.message);
      toast({
        title: "Failed to delete event",
        description: err.response?.data?.error || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleViewEvent = (event: Event) => {

   
    toast({
      title: "Event Details",
      description: `Viewing details for: ${event.title}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    onEditModalOpen();
  };

  const openDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    onDeleteModalOpen();
  };

  const openParticipantsModal = (event: Event) => {
    setSelectedEvent(event);
    onParticipantsModalOpen();
  };

  const refreshEvents = async () => {
    setIsLoading(true);
    await fetchEvents();
    toast({
      title: "Events refreshed successfully! 🔄",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Statistics
  const totalEvents = events.length;
  // ✅ total confirmed participants across all events
  const totalParticipants = events?.reduce((sum, event) => {
    const confirmedCount = event.participants?.filter(
      (p: any) => p.status === "CONFIRMED"
    ).length || 0;
    return sum + confirmedCount;
  }, 0);

  // ✅ total pending approvals (participants with status PENDING in events that requireApproval)
  const pendingApprovals = events.reduce((sum, event) => {

    const pendingCount = event.participants?.filter(
      (p: any) => p.status === "PENDING"
    ).length || 0;

    return sum + pendingCount;
  }, 0);

  const activeEvents = events.filter(event => event.status === "ACTIVE").length;


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
                        <StatNumber color="white" fontSize="2xl">{Number(totalParticipants) || 0}</StatNumber>
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
                    <option value="OTHER">Other</option>
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
            {isLoading ? (
              <Center py={12}>
                <Spinner size="xl" color="yellow.400" />
              </Center>
            ) : filteredEvents.length === 0 ? (
              <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={12}>
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
                  alignItems="stretch"
                >
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <MotionBox
                        key={event.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        h="100%"
                      >
                        <EventCard
                          event={event}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          onView={()=>{router.push(`/events/${event.id}`)}}
                          onManageParticipants={openParticipantsModal}
                        />
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <HStack justify="center" mt={8} spacing={4}>
                    <Button
                      leftIcon={<FaArrowLeft />}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      isDisabled={page === 1}
                      variant="outline"
                      colorScheme="gray"
                    >
                      Previous
                    </Button>
                    <Text color="gray.400">
                      Page {page} of {totalPages}
                    </Text>
                    <Button
                      rightIcon={<FaArrowRight />}
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      isDisabled={page === totalPages}
                      variant="outline"
                      colorScheme="gray"
                    >
                      Next
                    </Button>
                  </HStack>
                )}
              </>
            )}
          </MotionBox>
          <MotionBox
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <TeamMembersSection company={company} user={user} />
          </MotionBox>

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
          <ModalBody>
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
            {selectedEvent && selectedEvent.confirmedParticipants > 0 && (
              <Alert status="error" bg="red.900" border="1px" borderColor="red.600" borderRadius="lg" mt={4}>
                <AlertIcon color="red.400" />
                <Box>
                  <AlertTitle color="red.200">Event has participants!</AlertTitle>
                  <AlertDescription color="red.300">
                    This event has {selectedEvent.confirmedParticipants} registered participants.
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

      {/* Participants Modal */}
      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={onParticipantsModalClose}
        event={selectedEvent}
      />
    </Box>
  );
};

export default AdminEventsDashboard;