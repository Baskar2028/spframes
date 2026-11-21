export const siteConfig = {
  businessName: "SPFRAMES",
  whatsappNumber: "917708872251", // Replace with country code + number, digits only
  phoneDisplay: "+91 77088 72251",
  email: "atexra12@gmail.com",
  address: "Studio address placeholder, Erode, Tamil Nadu, India",
  instagram: "https://instagram.com/spframes",
  facebook: "https://facebook.com/spframes",
  youtube: "https://youtube.com/@spframes",
  ownerName: "Owner name to be added",
  ownerPhoto: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80",
  mapsEmbed: ""
};
export const whatsappUrl = (message = "Hello SPFRAMES, I would like to know more about your photography services.") =>
  `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
export const buildBookingMessage = ({
  name,
  phone,
  email,
  service,
  eventDate,
  location,
  guests,
  budget,
  details,
}) =>
  [
    "Hello SPFRAMES, I would like to book a session.",
    `Name: ${name}`,
    `Phone: ${phone}`,
    email && `Email: ${email}`,
    `Service: ${service}`,
    eventDate && `Event date: ${eventDate}`,
    location && `Location: ${location}`,
    guests && `Guests: ${guests}`,
    budget && `Budget: ${budget}`,
    details && `Details: ${details}`,
  ]
    .filter(Boolean)
    .join("\n");
