"use client";
import { useState } from "react";
import { Box, Image, Flex, IconButton, background } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

type Attachment = {
  id: number;
  eventId?: number;
  url: string;
  type?: "IMAGE" | "VIDEO";
  publicId?: string;
  createdAt?: string;
};

export default function EventMediaCarousel({ attachments }: { attachments: Attachment[] }) {
  const [current, setCurrent] = useState(0);

  if (!attachments || attachments.length === 0) {
    return (
      <Box w="100%" h="250px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
        No media available
      </Box>
    );
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box position="relative" w="90%" h="600px" overflow="hidden" borderRadius="lg" mx="auto" my={4}>
      {attachments[current].type === "IMAGE" ? (
        <Image
          src={attachments[current].url}
          alt={`attachment-${attachments[current].id}`}
          w="100%"
          h="100%"
          objectFit="cover"
        />
      ) : (
        <video
          src={attachments[current].url}
          controls
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {attachments.length > 1 && (
        <Flex
          position="absolute"
          top="50%"
          left="0"
          right="0"
          justify="space-between"
          transform="translateY(-50%)"
          px={2}
        >
          <IconButton aria-label="Previous"  icon={<ChevronLeftIcon /> }background={"gray.700"} onClick={prevSlide} />
          <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={nextSlide} background={"gray.700"}/>
        </Flex>
      )}
    </Box>
  );
}
