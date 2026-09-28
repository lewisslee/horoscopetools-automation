# -*- coding: utf-8 -*-
"""12 星座事实数据 —— 全站唯一事实源。
数据为通行的占星传统设定，非占星主张。日期采用西方主流表（tropical zodiac）。
"""

SIGNS = [
    dict(slug="aries", name="Aries", glyph="♈", dates="March 21 – April 19",
         dates_short="Mar 21 – Apr 19", element="Fire", modality="Cardinal",
         ruler="Mars", opposite="Libra", birthstone="Diamond", symbol="The Ram",
         pos=0, dates_lo="03-21", dates_hi="04-19"),

    dict(slug="taurus", name="Taurus", glyph="♉", dates="April 20 – May 20",
         dates_short="Apr 20 – May 20", element="Earth", modality="Fixed",
         ruler="Venus", opposite="Scorpio", birthstone="Emerald", symbol="The Bull",
         pos=1, dates_lo="04-20", dates_hi="05-20"),

    dict(slug="gemini", name="Gemini", glyph="♊", dates="May 21 – June 20",
         dates_short="May 21 – Jun 20", element="Air", modality="Mutable",
         ruler="Mercury", opposite="Sagittarius", birthstone="Pearl", symbol="The Twins",
         pos=2, dates_lo="05-21", dates_hi="06-20"),

    dict(slug="cancer", name="Cancer", glyph="♋", dates="June 21 – July 22",
         dates_short="Jun 21 – Jul 22", element="Water", modality="Cardinal",
         ruler="Moon", opposite="Capricorn", birthstone="Ruby", symbol="The Crab",
         pos=3, dates_lo="06-21", dates_hi="07-22"),

    dict(slug="leo", name="Leo", glyph="♌", dates="July 23 – August 22",
         dates_short="Jul 23 – Aug 22", element="Fire", modality="Fixed",
         ruler="Sun", opposite="Aquarius", birthstone="Peridot", symbol="The Lion",
         pos=4, dates_lo="07-23", dates_hi="08-22"),

    dict(slug="virgo", name="Virgo", glyph="♍", dates="August 23 – September 22",
         dates_short="Aug 23 – Sep 22", element="Earth", modality="Mutable",
         ruler="Mercury", opposite="Pisces", birthstone="Sapphire", symbol="The Maiden",
         pos=5, dates_lo="08-23", dates_hi="09-22"),

    dict(slug="libra", name="Libra", glyph="♎", dates="September 23 – October 22",
         dates_short="Sep 23 – Oct 22", element="Air", modality="Cardinal",
         ruler="Venus", opposite="Scorpio", birthstone="Opal", symbol="The Scales",
         pos=6, dates_lo="09-23", dates_hi="10-22"),

    dict(slug="scorpio", name="Scorpio", glyph="♏", dates="October 23 – November 21",
         dates_short="Oct 23 – Nov 21", element="Water", modality="Fixed",
         ruler="Pluto / Mars", opposite="Taurus", birthstone="Topaz", symbol="The Scorpion",
         pos=7, dates_lo="10-23", dates_hi="11-21"),

    dict(slug="sagittarius", name="Sagittarius", glyph="♐", dates="November 22 – December 21",
         dates_short="Nov 22 – Dec 21", element="Fire", modality="Mutable",
         ruler="Jupiter", opposite="Gemini", birthstone="Turquoise", symbol="The Archer",
         pos=8, dates_lo="11-22", dates_hi="12-21"),

    dict(slug="capricorn", name="Capricorn", glyph="♑", dates="December 22 – January 19",
         dates_short="Dec 22 – Jan 19", element="Earth", modality="Cardinal",
         ruler="Saturn", opposite="Cancer", birthstone="Garnet", symbol="The Sea Goat",
         pos=9, dates_lo="12-22", dates_hi="01-19"),

    dict(slug="aquarius", name="Aquarius", glyph="♒", dates="January 20 – February 18",
         dates_short="Jan 20 – Feb 18", element="Air", modality="Fixed",
         ruler="Uranus / Saturn", opposite="Leo", birthstone="Amethyst", symbol="The Water Bearer",
         pos=10, dates_lo="01-20", dates_hi="02-18"),

    dict(slug="pisces", name="Pisces", glyph="♓", dates="February 19 – March 20",
         dates_short="Feb 19 – Mar 20", element="Water", modality="Mutable",
         ruler="Neptune / Jupiter", opposite="Virgo", birthstone="Aquamarine", symbol="The Fish",
         pos=11, dates_lo="02-19", dates_hi="03-20"),
]

BY_SLUG = {s["slug"]: s for s in SIGNS}
ORDER = [s["slug"] for s in SIGNS]
