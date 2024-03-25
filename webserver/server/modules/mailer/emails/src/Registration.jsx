import { Button, Head, Html, Body, Preview, Container, Column, Heading, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { DiscordIcon, InstagramIcon, YoutubeIcon } from "./Components/Svg";

export default function Email({ baseUrl, confirmationLink, name }) {

  // remove in prodution maybe
  if(baseUrl == null) baseUrl = "https://widgetsgarden.com";

  const footerText = {
    fontSize: "12px",
    color: "#b7b7b7",
    lineHeight: "15px",
    textAlign: "left",
    marginBottom: "50px",
  };

  const footerLink = {
    color: "#616161",
    textDecoration: "underline",
  };

  const footerLogos = {
    marginBottom: "32px",
    paddingLeft: "8px",
    paddingRight: "8px",
    width: "100%",
  };

  const socialMediaIcon = {
    display: "inline",
    marginLeft: "32px",
  };

  const main = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  };

  const container = {
    margin: "0 auto",
    padding: "0px 20px",
  };

  const logoContainer = {
    marginTop: "32px",
  };

  const h1 = {
    color: "#1d1c1d",
    fontSize: "36px",
    fontWeight: "700",
    margin: "30px 0",
    padding: "0",
    lineHeight: "42px",
  };

  const heroText = {
    fontSize: "20px",
    lineHeight: "28px",
    marginBottom: "30px",
  };

  const codeBox = {
    background: "rgb(245, 244, 245)",
    borderRadius: "4px",
    marginBottom: "30px",
    padding: "40px 10px",
  };

  const confirmationCodeText = {
    fontSize: "30px",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const text = {
    color: "#000",
    fontSize: "14px",
    lineHeight: "24px",
  };

  return (
    <Html>
      <Head />
      <Preview>Welcome to WidgetsGarden {name}!</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src={`${baseUrl}/logo/email.png`} width="120" height="36" alt="WidgetsGarden" />
          </Section>
          <Heading style={h1}>Account created</Heading>
          <Text style={heroText}>Thank you for creating an account. Please confirm your email address.</Text>

          <Button href={confirmationLink} style={{ background: "#000", color: "#fff", padding: "12px 20px" }}>
            Click here to confirm your account.
          </Button>

          <Text style={text}>If you didn't request this email, you can contact us for account support.</Text>

          <Section>
            <Row style={footerLogos}>
              <Column style={{ width: "66%" }}>
                <Img src={`${baseUrl}/logo/email.png`} width="120" height="36" alt="WidgetsGarden" />
              </Column>
              <Column>
                <Section>
                  <Row>
                    <Column>
                      <Link href="/">
                        <InstagramIcon/>
                      </Link>
                    </Column>
                    <Column>
                      <Link href="/">
                        <DiscordIcon/>
                      </Link>
                    </Column>
                    <Column>
                      <Link href="/">
                          <YoutubeIcon />
                      </Link>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>
          </Section>

          <Section>
            <Link style={footerLink} href="https://widgetsgarden.com/" target="_blank" rel="noopener noreferrer">
              Home
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link style={footerLink} href="https://widgetsgarden.com/" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link style={footerLink} href="https://widgetsgarden.com/dashboard" target="_blank" rel="noopener noreferrer">
              Dashboard
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link style={footerLink} href="https://widgetsgarden.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-linkindex="6">
              Discord Community
            </Link>
            <Text style={footerText}>
              ©2024 WidgetGgarden <br />
              All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
