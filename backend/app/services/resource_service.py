"""
resource_service.py
-------------------
Handles ICU and Ward allocation logic.
"""

from app.db.resource_repo import get_resources, update_resources
from datetime import datetime


def allocate_bed(emergency_flag: int):

    resources = get_resources()

    icu_total = resources["icu_total"]
    icu_occupied = resources["icu_occupied"]

    ward_total = resources["ward_total"]
    ward_occupied = resources["ward_occupied"]

    if emergency_flag == 1:
        # ICU Allocation
        if icu_occupied >= icu_total:
            return {"error": "No ICU beds available"}

        icu_occupied += 1

        update_resources({
            "icu_occupied": icu_occupied,
            "last_updated": datetime.utcnow()
        })

        return {"allocated": "ICU"}

    else:
        # Ward Allocation
        if ward_occupied >= ward_total:
            return {"error": "No ward beds available"}

        ward_occupied += 1

        update_resources({
            "ward_occupied": ward_occupied,
            "last_updated": datetime.utcnow()
        })

        return {"allocated": "WARD"}