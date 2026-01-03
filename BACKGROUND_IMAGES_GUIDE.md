# Guide: Adding Service Pictures as Background Images

This guide explains how to add service photos as background images to various sections of the website.

## Available Sections for Background Images

### 1. **Hero Section** (Homepage - Top Section)
- **Current**: Uses `Columbus GA.jpg`
- **Best for**: Main service photo, congregation worshiping
- **Location**: `index.html` lines 188-206
- **How to change**: Replace `Columbus GA.jpg` with your service photo filename

### 2. **Worship Section** (Homepage - "Sunday Worship" Section)
- **Current**: White background
- **Best for**: Service photos, communion, worship moments
- **Location**: `index.html` lines 297-329
- **How to add**: See instructions below

### 3. **About Section** (Homepage - "About Trinity Reformed Church")
- **Current**: White background
- **Best for**: Community photos, fellowship, church gatherings
- **Location**: `index.html` lines 209-228
- **How to add**: See instructions below

### 4. **Distinctives Section** (Homepage - "What Makes Us Distinctive")
- **Current**: Light gray background
- **Best for**: Fellowship meals, community activities, children in service
- **Location**: `index.html` lines 231-256
- **How to add**: See instructions below

### 5. **Contact Section** (Homepage - "Contact Us")
- **Current**: Light gray background
- **Best for**: Subtle church building or community photo
- **Location**: `index.html` lines 335-390
- **How to add**: See instructions below

## How to Add Background Images

### Step 1: Prepare Your Images
1. Save your service photos in the same folder as `index.html`
2. Recommended image sizes:
   - **Hero Section**: 1920x1080px or larger (wide format)
   - **Other Sections**: 1920x800px or larger (wide format)
3. Optimize images for web (compress to reduce file size while maintaining quality)

### Step 2: Add Background Image to a Section

#### For the **Worship Section**:
1. Open `index.html`
2. Find the `<section id="worship" class="worship">` tag (around line 297)
3. Add the background structure right after the opening `<section>` tag:

```html
<section id="worship" class="worship with-background">
    <div class="worship-background">
        <img src="your-service-photo.jpg" alt="Worship Service">
        <div class="worship-overlay"></div>
    </div>
    <div class="container">
        <!-- existing content -->
    </div>
</section>
```

#### For the **About Section**:
1. Find the `<section id="about" class="about">` tag (around line 209)
2. Add the background structure:

```html
<section id="about" class="about with-background">
    <div class="about-background">
        <img src="your-community-photo.jpg" alt="Church Community">
        <div class="about-overlay"></div>
    </div>
    <div class="container">
        <!-- existing content -->
    </div>
</section>
```

#### For the **Distinctives Section**:
1. Find the `<section id="distinctives" class="distinctives">` tag (around line 231)
2. Add the background structure:

```html
<section id="distinctives" class="distinctives with-background">
    <div class="distinctives-background">
        <img src="your-fellowship-photo.jpg" alt="Fellowship">
        <div class="distinctives-overlay"></div>
    </div>
    <div class="container">
        <!-- existing content -->
    </div>
</section>
```

#### For the **Contact Section**:
1. Find the `<section id="contact" class="contact">` tag (around line 335)
2. Add the background structure:

```html
<section id="contact" class="contact with-background">
    <div class="contact-background">
        <img src="your-church-photo.jpg" alt="Trinity Reformed Church">
        <div class="contact-overlay"></div>
    </div>
    <div class="container">
        <!-- existing content -->
    </div>
</section>
```

### Step 3: Adjust Image Opacity (Optional)
If you want to make the background image more or less visible, edit `styles.css`:

- Find the section's background image style (e.g., `.worship-background img`)
- Change the `opacity` value:
  - `0.2` = very subtle
  - `0.3` = subtle (default)
  - `0.4` = more visible
  - `0.5` = quite visible

### Step 4: Adjust Overlay Darkness (Optional)
To make text more readable or change the overlay effect:

- Find the section's overlay style (e.g., `.worship-overlay`)
- Adjust the `background` gradient:
  - Lighter: `rgba(255, 255, 255, 0.9)` (more white)
  - Darker: `rgba(255, 255, 255, 0.7)` (less white, more image shows through)

## Example: Complete Worship Section with Background

```html
<!-- Worship Section -->
<section id="worship" class="worship with-background">
    <div class="worship-background">
        <img src="service-photo.jpg" alt="Sunday Worship Service">
        <div class="worship-overlay"></div>
    </div>
    <div class="container">
        <div class="section-header">
            <img src="Church symbol.png" alt="Church Symbol" class="section-icon">
            <h2>Sunday Worship</h2>
        </div>
        <div class="worship-content">
            <!-- rest of content -->
        </div>
    </div>
</section>
```

## Tips for Best Results

1. **Image Quality**: Use high-resolution images (at least 1920px wide) for crisp display on all devices
2. **Image Content**: Choose photos that are not too busy - simple, focused images work best
3. **Text Readability**: The overlay ensures text remains readable, but test on your actual images
4. **File Size**: Compress images before uploading to keep page load times fast
5. **Alt Text**: Always include descriptive alt text for accessibility

## Removing Background Images

To remove a background image from a section:
1. Remove the `with-background` class from the `<section>` tag
2. Remove the background div structure (the `<div class="section-background">` and overlay)
3. The section will return to its original solid color background

