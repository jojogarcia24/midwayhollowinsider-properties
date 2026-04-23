## Tour Client Email (HTML)

```html
<html>
  <body style="font-family: Arial, sans-serif; color: #111;">
    <h2>Tour Request Received — Midway Hollow Insider</h2>
    <p>Hi {{contact.first_name}},</p>
    <p>Thanks for requesting a tour. We received your details and an Elite Living Realty team member will confirm shortly.</p>
    <p><strong>Requested Tour Type:</strong> {{custom_values.tourType}}<br/>
    <strong>Date:</strong> {{custom_values.tourDate}}<br/>
    <strong>Time:</strong> {{custom_values.tourTime}}</p>
    <p><strong>Property:</strong> {{custom_values.UnparsedAddress}}</p>
    <p>If you need to update anything, just reply to this email.</p>
    <p>— Elite Living Realty</p>
  </body>
</html>
```

## Tour Agent Email (HTML)

```html
<html>
  <body style="font-family: Arial, sans-serif; color: #111;">
    <h2>New Tour Lead</h2>
    <p><strong>Name:</strong> {{contact.first_name}} {{contact.last_name}}<br/>
    <strong>Email:</strong> {{contact.email}}<br/>
    <strong>Phone:</strong> {{contact.phone}}</p>
    <p><strong>Tour Type:</strong> {{custom_values.tourType}}<br/>
    <strong>Date:</strong> {{custom_values.tourDate}}<br/>
    <strong>Time:</strong> {{custom_values.tourTime}}</p>
    <p><strong>Property:</strong> {{custom_values.UnparsedAddress}}<br/>
    <strong>Listing ID:</strong> {{custom_values.ListingId}}</p>
    <p><strong>Working with Agent:</strong> {{custom_values.workingWithAgent}}<br/>
    <strong>Notes:</strong> {{custom_values.notes}}</p>
    <p><strong>Consents:</strong> Email={{custom_values.emailConsent}} | SMS={{custom_values.smsConsent}}</p>
  </body>
</html>
```

## Tour Client SMS

```text
Hi {{contact.first_name}} — we received your Midway Hollow tour request for {{custom_values.UnparsedAddress}} on {{custom_values.tourDate}} at {{custom_values.tourTime}}. We’ll confirm shortly. - Elite Living Realty
```

## Tour Agent SMS

```text
New TOUR lead: {{contact.first_name}} {{contact.last_name}}, {{contact.phone}}, {{custom_values.UnparsedAddress}}, {{custom_values.tourDate}} {{custom_values.tourTime}}, emailConsent={{custom_values.emailConsent}}, smsConsent={{custom_values.smsConsent}}
```

## Offer Client Email (HTML)

```html
<html>
  <body style="font-family: Arial, sans-serif; color: #111;">
    <h2>Offer Submission Received — Midway Hollow Insider</h2>
    <p>Hi {{contact.first_name}},</p>
    <p>Thanks for submitting your offer. We’ve received everything and an Elite Living Realty team member will follow up soon.</p>
    <p><strong>Property:</strong> {{custom_values.UnparsedAddress}}<br/>
    <strong>Offer Amount:</strong> {{custom_values.offerAmount}}<br/>
    <strong>Financing:</strong> {{custom_values.finance}}</p>
    <p>Reply to this email if you want to make any updates.</p>
    <p>— Elite Living Realty</p>
  </body>
</html>
```

## Offer Agent Email (HTML)

```html
<html>
  <body style="font-family: Arial, sans-serif; color: #111;">
    <h2>New Offer Lead</h2>
    <p><strong>Name:</strong> {{contact.first_name}} {{contact.last_name}}<br/>
    <strong>Email:</strong> {{contact.email}}<br/>
    <strong>Phone:</strong> {{contact.phone}}</p>
    <p><strong>Property:</strong> {{custom_values.UnparsedAddress}}<br/>
    <strong>Listing ID:</strong> {{custom_values.ListingId}}</p>
    <p><strong>Offer Amount:</strong> {{custom_values.offerAmount}}<br/>
    <strong>Financing:</strong> {{custom_values.finance}}<br/>
    <strong>Down %:</strong> {{custom_values.downPercent}}<br/>
    <strong>Down $:</strong> {{custom_values.downAmount}}</p>
    <p><strong>Toured Before:</strong> {{custom_values.touredBefore}}<br/>
    <strong>Notes:</strong> {{custom_values.notes}}</p>
    <p><strong>Consents:</strong> Email={{custom_values.emailConsent}} | SMS={{custom_values.smsConsent}}</p>
  </body>
</html>
```

## Offer Client SMS

```text
Hi {{contact.first_name}} — your offer for {{custom_values.UnparsedAddress}} was received. Our team will contact you shortly with next steps. - Elite Living Realty
```

## Offer Agent SMS

```text
New OFFER lead: {{contact.first_name}} {{contact.last_name}}, {{contact.phone}}, {{custom_values.UnparsedAddress}}, offer={{custom_values.offerAmount}}, finance={{custom_values.finance}}, emailConsent={{custom_values.emailConsent}}, smsConsent={{custom_values.smsConsent}}
```
