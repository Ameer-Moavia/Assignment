"use client";
import {
  Flex,
  Box,
  Button,
  Link as ChakraLink,
  IconButton,
  useDisclosure,
  VStack,
  HStack,
  useColorModeValue,
  Container,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaCalendarAlt, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt, FaCog, FaChevronDown, FaTachometerAlt } from "react-icons/fa";
import { useUserStore } from "@/utils/stores/useUserStore";
import { useCompanyStore } from "@/utils/stores/useCompanyStore";
import { useRouter } from "next/navigation";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
  variant?: "solid" | "outline" | "ghost";
  colorScheme?: string;
  onClick?: () => void;
}

const NavLink = ({ href, children, icon, variant = "ghost", colorScheme = "yellow", onClick }: NavLinkProps) => (
  <Button
    as={Link}
    href={href}
    size="sm"
    variant={variant}
    colorScheme={colorScheme}
    leftIcon={icon}
    borderColor={variant === "outline" ? "yellow.400" : undefined}
    color={variant === "outline" ? "yellow.400" : undefined}
    _hover={{
      bg: variant === "outline" ? "yellow.400" : variant === "ghost" ? "yellow.400" : "yellow.500",
      color: variant === "outline" || variant === "ghost" ? "black" : "white",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)"
    }}
    transition="all 0.2s ease"
    fontWeight="medium"
    onClick={onClick}
  >
    {children}
  </Button>
);

function handleLogout() {
  // Clear user from Zustand store and localStorage
  const { clearUser } = useUserStore.getState();
  const { clearCompany } = useCompanyStore.getState();
  clearCompany();
  clearUser();
  localStorage.removeItem("user");
  localStorage.removeItem("user-storage");
  localStorage.removeItem("company");
  localStorage.removeItem("comapny");
  localStorage.removeItem("company-storage");

  // Redirect to home or login page
  window.location.href = "/auth/login";
}
export default function Header() {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const { user } = useUserStore();
  const bg = useColorModeValue("gray.900", "black");
  const borderColor = useColorModeValue("yellow.400", "yellow.300");
  const logoGradient = "linear(to-r, yellow.400, yellow.600)";
  const router = useRouter();
  const role = user?.user?.role;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <MotionBox
      as="header"
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bg}
      backdropFilter="blur(10px)"
      borderBottom="1px"
      borderColor={isScrolled ? "yellow.400" : "transparent"}
      boxShadow={isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "none"}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Container maxW="container.xl">
        <Flex
          py={{ base: 3, md: 4 }}
          justify="space-between"
          align="center"
          color="white"
        >
          {/* Logo */}
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <ChakraLink
              as={Link}
              href="/"
              fontWeight="bold"
              fontSize={{ base: "lg", md: "xl" }}
              bgGradient={logoGradient}
              bgClip="text"
              _hover={{
                textDecoration: "none",
                filter: "brightness(1.2)"
              }}
              transition="all 0.2s ease"
            >
              ✨ Wizard Productions
            </ChakraLink>
          </MotionBox>

          {/* Desktop Navigation */}
          {!isAuthPage && (
            <HStack spacing={3} display={{ base: "none", md: "flex" }}>
              <NavLink
                href="/events"
                icon={<FaCalendarAlt />}
                variant="ghost"
              >
                Events
              </NavLink>

              {user ? (
                // User is logged in - show user menu
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    variant="ghost"
                    rightIcon={<FaChevronDown />}
                    leftIcon={<Avatar size="xs" name={user?.user.email} />}
                    color="yellow.400"
                    _hover={{
                      bg: "yellow.400",
                      color: "black"
                    }}
                    _active={{
                      bg: "yellow.500"
                    }}
                    fontWeight="medium"
                  >
                    {user?.user?.name || user?.user.email?.split('@')[0]}
                  </MenuButton>
                  <MenuList bg="gray.800" borderColor="yellow.400">
                    <MenuItem
                      icon={<FaUser />}
                      bg="gray.800"
                      _hover={{ bg: "gray.700" }}
                      color="white"
                      as={Link}
                      href={role === "PARTICIPANT" ? "/participant/profile" : "/admin/profile"}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      icon={<FaTachometerAlt />}
                      bg="gray.800"
                      _hover={{ bg: "gray.700" }}
                      color="white"
                      onClick={() => {
                        if (role === "PARTICIPANT") {
                          router.push("/participant/dashboard");
                        } else {
                          router.push("/admin/dashboard");
                        }
                      }}
                    >
                      Dashboard
                    </MenuItem>

                    <MenuItem
                      icon={<FaSignOutAlt />}
                      bg="gray.800"
                      _hover={{ bg: "red.600" }}
                      color="red.400"
                      onClick={handleLogout}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                // User not logged in - show auth buttons
                <>
                  <NavLink
                    href="/auth/login"
                    icon={<FaSignInAlt />}
                    variant="solid"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    href="/auth/signup"
                    icon={<FaUserPlus />}
                    variant="outline"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </HStack>
          )}

          {/* Mobile Menu Button */}
          {!isAuthPage && (
            <MotionBox
              display={{ base: "block", md: "none" }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                aria-label="Toggle navigation"
                icon={isOpen ? <FaTimes /> : <FaBars />}
                onClick={onToggle}
                variant="ghost"
                color="yellow.400"
                _hover={{
                  bg: "yellow.400",
                  color: "black"
                }}
                _active={{
                  bg: "yellow.500"
                }}
                transition="all 0.2s ease"
              />
            </MotionBox>
          )}
        </Flex>

        {/* Mobile Navigation Menu */}
        {!isAuthPage && (
          <AnimatePresence>
            {isOpen && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                overflow="hidden"
              >
                <VStack
                  spacing={3}
                  pb={6}
                  pt={2}
                  align="stretch"
                  display={{ base: "flex", md: "none" }}
                >
                  <MotionBox
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <NavLink
                      href="/events"
                      icon={<FaCalendarAlt />}
                      variant="ghost"
                      onClick={onClose}
                    >
                      Events
                    </NavLink>
                  </MotionBox>

                  {user ? (
                    // Mobile user menu items
                    <>
                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Box
                          p={3}
                          borderRadius="md"
                          bg="gray.800"
                          border="1px"
                          borderColor="yellow.400"
                        >
                          <Text fontSize="sm" color="yellow.400" fontWeight="medium">
                            Welcome, {user?.user?.name || user?.user?.email?.split('@')[0]}!
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {role|| 'User'}
                          </Text>
                        </Box>
                      </MotionBox>

                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <NavLink
                         href={role === "PARTICIPANT" ? "/participant/profile" : "/admin/profile"}
                          icon={<FaUser />}
                          variant="ghost"
                          onClick={onClose}
                        >
                          Profile
                        </NavLink>
                      </MotionBox>
                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        <NavLink
                          href={role === "PARTICIPANT" ? "/participant/dashboard" : "/admin/dashboard"}
                          icon={<FaTachometerAlt />} // dashboard icon
                          variant="ghost"
                          onClick={onClose}
                        >
                          Dashboard
                        </NavLink>
                      </MotionBox>
                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          leftIcon={<FaSignOutAlt />}
                          onClick={() => {
                            handleLogout();
                            onClose();
                          }}
                          borderColor="red.400"
                          color="red.400"
                          _hover={{
                            bg: "red.400",
                            color: "white"
                          }}
                          transition="all 0.2s ease"
                          fontWeight="medium"
                          w="full"
                        >
                          Logout
                        </Button>
                      </MotionBox>
                    </>
                  ) : (
                    // Mobile auth buttons
                    <>
                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <NavLink
                          href="/auth/login"
                          icon={<FaSignInAlt />}
                          variant="solid"
                          onClick={onClose}
                        >
                          Login
                        </NavLink>
                      </MotionBox>

                      <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <NavLink
                          href="/auth/signup"
                          icon={<FaUserPlus />}
                          variant="outline"
                          onClick={onClose}
                        >
                          Sign Up
                        </NavLink>
                      </MotionBox>
                    </>
                  )}

                  {/* Mobile Menu Footer */}
                  <MotionBox
                    pt={4}
                    borderTop="1px"
                    borderColor="gray.700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    <Text
                      fontSize="xs"
                      textAlign="center"
                      color="gray.400"
                    >
                      Create amazing events with Wizard Productions
                    </Text>
                  </MotionBox>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        )}
      </Container>
    </MotionBox>
  );
}