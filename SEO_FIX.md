# SEO Indexing Issues - Fix Guide

## Issues Identified by Google Search Console

1. **Page with redirect**
2. **Redirect error**
3. **Duplicate without user-selected canonical**
4. **Alternate page with proper canonical tag** (NEW)

## Root Cause

The CNAME file was pointing to `www.trinityreformedcrec.com`, but all canonical URLs in the HTML files use `https://trinityreformedcrec.com/` (non-www). This mismatch can cause:
- Redirect errors when Google tries to access www vs non-www versions
- Duplicate content issues (same page accessible via both www and non-www)

## Fix Applied

✅ Updated CNAME file to use `trinityreformedcrec.com` (non-www) to match all canonical URLs
✅ Created robots.txt file to help guide Google's crawler

## Additional Steps Required

### 1. Set Up Domain Redirects (At Your Domain/Hosting Provider)

You need to set up redirects at your domain registrar or hosting provider to ensure:
- `www.trinityreformedcrec.com` → redirects to → `trinityreformedcrec.com`
- `http://trinityreformedcrec.com` → redirects to → `https://trinityreformedcrec.com` (if not already)

**For GitHub Pages:**
- If using a custom domain, configure redirects in your domain registrar's DNS settings
- Most registrars allow you to set up URL forwarding/redirects

**For Other Hosting:**
- Check your hosting provider's documentation for setting up redirects
- You may need to create a `.htaccess` file or configure redirects in the hosting control panel

### 2. Verify in Google Search Console

After making changes:
1. Go to Google Search Console
2. Use the URL Inspection tool to test both www and non-www versions
3. Request indexing for the canonical (non-www) versions
4. Monitor the "Coverage" report to see if issues are resolved

### 3. Check for Other Duplicate Content

Ensure that:
- `/index.html` redirects to `/` (or vice versa) - choose one canonical version
- All pages have proper canonical tags (✅ Already done)
- No duplicate pages exist with different URLs

### 4. Update Sitemap (If You Have One)

If you have a sitemap.xml file, ensure it only lists the canonical (non-www) URLs.

## Current Canonical URLs (All Non-WWW)

All pages correctly use non-www canonical URLs:
- `https://trinityreformedcrec.com/` (homepage)
- `https://trinityreformedcrec.com/music.html`
- `https://trinityreformedcrec.com/calendar.html`
- `https://trinityreformedcrec.com/sacraments.html`
- `https://trinityreformedcrec.com/liturgy.html`
- `https://trinityreformedcrec.com/confessions.html`
- `https://trinityreformedcrec.com/creeds.html`
- `https://trinityreformedcrec.com/more-info.html`

## Understanding "Alternate page with proper canonical tag"

This warning means Google found pages that have canonical tags pointing to other pages. This is actually **correct behavior** - those pages are marked as alternates and won't be indexed separately. However, Google is warning you about it.

**Common causes:**
- Google accessing both www and non-www versions (one canonicalizes to the other)
- Google accessing both `/` and `/index.html` (if both are accessible)
- Google accessing URLs with/without trailing slashes

**What this means:**
- Pages with canonical tags pointing to other pages are correctly marked as alternates
- Google will index the canonical version, not the alternate
- This is the intended behavior for duplicate content

**To resolve:**
1. Ensure all canonical tags are self-referential (✅ Already done - each page points to itself)
2. Set up server-level redirects so alternate URLs redirect to canonical versions
3. The robots.txt file helps guide Google's crawler

## Next Steps

1. ✅ CNAME updated (done)
2. ✅ robots.txt created (done)
3. ⏳ Set up redirects at domain/hosting level (CRITICAL)
4. ⏳ Verify in Google Search Console
5. ⏳ Request re-indexing after redirects are set up

