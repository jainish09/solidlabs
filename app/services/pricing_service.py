"""Pricing and Indicative Quotation Engine.

Provides transparent, deterministic manufacturing cost estimation for 3D Printing (FDM, SLA, SLS)
and CNC 3-Axis Machining.

Core Philosophy:
- Documented physics and mechanical costing formulas.
- Never conflates bounding-box volume with true solid material consumption.
- Differentiates additive infill/shell physics from subtractive billet removal.
- Explicitly flags indicative nature: indicative estimates, not binding production contracts.
"""

from typing import Dict, Any, List, Optional
from app.schemas.quote import (
    QuoteCreateRequest,
    CADQuoteResponse,
    LineItem,
)


class PricingError(Exception):
    """Domain error for pricing validation or calculation failures."""
    pass


# Compatibility matrix between processes and materials
PROCESS_MATERIAL_MATRIX = {
    "3d_printing_fdm": ["pla", "abs", "petg"],
    "3d_printing_sla": ["resin_standard"],
    "3d_printing_sls": ["nylon"],
    "cnc_machining_3axis": [
        "aluminum_6061",
        "steel_1018",
        "stainless_304",
        "brass_360",
        "abs",
        "nylon",
    ],
}

# Material physical and cost constants
# Density in g/cm^3, Base stock cost in USD per kg
MATERIAL_SPECS = {
    "pla": {"name": "PLA Polymer", "density_g_cm3": 1.24, "cost_per_kg_usd": 24.0, "machinability_rating": 1.0},
    "abs": {"name": "ABS Thermoplastic", "density_g_cm3": 1.04, "cost_per_kg_usd": 28.0, "machinability_rating": 1.1},
    "petg": {"name": "PETG Copolymer", "density_g_cm3": 1.27, "cost_per_kg_usd": 26.0, "machinability_rating": 1.0},
    "resin_standard": {"name": "Standard Photopolymer Resin", "density_g_cm3": 1.15, "cost_per_kg_usd": 65.0, "machinability_rating": 0.0},
    "nylon": {"name": "PA12 Polyamide / Nylon", "density_g_cm3": 1.01, "cost_per_kg_usd": 75.0, "machinability_rating": 1.3},
    "aluminum_6061": {"name": "Aluminum 6061-T6", "density_g_cm3": 2.70, "cost_per_kg_usd": 12.5, "machinability_rating": 1.0},
    "steel_1018": {"name": "Mild Steel 1018", "density_g_cm3": 7.87, "cost_per_kg_usd": 6.8, "machinability_rating": 2.0},
    "stainless_304": {"name": "Stainless Steel 304", "density_g_cm3": 8.00, "cost_per_kg_usd": 18.0, "machinability_rating": 3.2},
    "brass_360": {"name": "Free-Cutting Brass 360", "density_g_cm3": 8.50, "cost_per_kg_usd": 22.0, "machinability_rating": 0.7},
}

# Process economic parameters
PROCESS_SPECS = {
    "3d_printing_fdm": {
        "name": "FDM 3D Printing",
        "setup_fee_base_usd": 15.0,
        "machine_hourly_rate_usd": 8.5,
        "deposition_rate_cm3_hr": 14.0,
        "infill_ratio": 0.25,
        "shell_support_factor": 1.20,
        "base_lead_time_days": 3,
    },
    "3d_printing_sla": {
        "name": "SLA Photopolymer Printing",
        "setup_fee_base_usd": 25.0,
        "machine_hourly_rate_usd": 16.0,
        "deposition_rate_cm3_hr": 18.0,
        "infill_ratio": 1.00,  # SLA typically prints solid
        "shell_support_factor": 1.25,
        "base_lead_time_days": 4,
    },
    "3d_printing_sls": {
        "name": "SLS Industrial Nylon Printing",
        "setup_fee_base_usd": 45.0,
        "machine_hourly_rate_usd": 28.0,
        "deposition_rate_cm3_hr": 35.0,
        "infill_ratio": 1.00,
        "shell_support_factor": 1.15,
        "base_lead_time_days": 5,
    },
    "cnc_machining_3axis": {
        "name": "CNC 3-Axis Milling",
        "setup_fee_base_usd": 85.0,  # CAM toolpath generation, vise probing, tool offsets
        "machine_hourly_rate_usd": 75.0,
        "mrr_cm3_min_aluminum": 18.0,  # Material removal rate benchmark
        "surface_finishing_cm2_min": 25.0,
        "stock_margin_mm": 6.0,  # 3mm oversize on each face
        "base_lead_time_days": 7,
    },
}


class PricingService:
    """Calculates transparent indicative quotes using deterministic costing equations."""

    @classmethod
    def calculate_quote(
        cls,
        analysis_data: Dict[str, Any],
        request: QuoteCreateRequest,
    ) -> Dict[str, Any]:
        """Validate input parameters and generate a transparent line-item quotation."""
        process = request.process
        material = request.material
        quantity = request.quantity
        finish = request.finish or "standard_as_machined"

        # Validate process and material compatibility
        allowed_materials = PROCESS_MATERIAL_MATRIX.get(process)
        if not allowed_materials:
            raise PricingError(f"Unsupported manufacturing process: '{process}'.")

        if material not in allowed_materials:
            allowed_str = ", ".join(allowed_materials)
            raise PricingError(
                f"Material '{material}' is not compatible with process '{process}'. "
                f"Supported materials for {process}: {allowed_str}"
            )

        geometry = analysis_data.get("geometry", {})
        bb = geometry.get("bounding_box", {})
        dim_x = float(bb.get("x", 10.0))
        dim_y = float(bb.get("y", 10.0))
        dim_z = float(bb.get("z", 10.0))
        is_volume_valid = bool(geometry.get("is_volume_valid", False))
        volume_mm3 = geometry.get("volume_mm3")
        surface_area_mm2 = geometry.get("surface_area_mm2") or (2 * (dim_x * dim_y + dim_y * dim_z + dim_x * dim_z))

        # Quantity economy-of-scale curve
        quantity_discount_factor = cls._get_quantity_factor(quantity)

        if "3d_printing" in process:
            return cls._calculate_additive_quote(
                analysis_id=analysis_data.get("analysis_id", ""),
                process=process,
                material=material,
                quantity=quantity,
                finish=finish,
                dim_x=dim_x,
                dim_y=dim_y,
                dim_z=dim_z,
                is_volume_valid=is_volume_valid,
                volume_mm3=volume_mm3,
                surface_area_mm2=surface_area_mm2,
                qty_factor=quantity_discount_factor,
            )
        else:
            return cls._calculate_subtractive_quote(
                analysis_id=analysis_data.get("analysis_id", ""),
                process=process,
                material=material,
                quantity=quantity,
                finish=finish,
                dim_x=dim_x,
                dim_y=dim_y,
                dim_z=dim_z,
                is_volume_valid=is_volume_valid,
                volume_mm3=volume_mm3,
                surface_area_mm2=surface_area_mm2,
                qty_factor=quantity_discount_factor,
            )

    @staticmethod
    def _get_quantity_factor(quantity: int) -> float:
        if quantity == 1:
            return 1.00
        elif quantity <= 4:
            return 0.94
        elif quantity <= 19:
            return 0.84
        elif quantity <= 49:
            return 0.74
        else:
            return 0.65

    @classmethod
    def _calculate_additive_quote(
        cls,
        analysis_id: str,
        process: str,
        material: str,
        quantity: int,
        finish: str,
        dim_x: float,
        dim_y: float,
        dim_z: float,
        is_volume_valid: bool,
        volume_mm3: Optional[float],
        surface_area_mm2: float,
        qty_factor: float,
    ) -> Dict[str, Any]:
        p_spec = PROCESS_SPECS[process]
        m_spec = MATERIAL_SPECS[material]

        # Explicit volume estimation:
        # If manifold watertight volume is valid, use true volume.
        # If not valid, fallback to bounding box * estimated 25% packing volume with explicit notice.
        approximate_volume_used = False
        if is_volume_valid and volume_mm3 and volume_mm3 > 0:
            part_volume_cm3 = volume_mm3 / 1000.0
        else:
            approximate_volume_used = True
            part_volume_cm3 = (dim_x * dim_y * dim_z / 1000.0) * 0.25

        infill_ratio = p_spec["infill_ratio"]
        support_waste_factor = p_spec["shell_support_factor"]
        effective_material_cm3 = part_volume_cm3 * infill_ratio * support_waste_factor

        part_weight_grams = effective_material_cm3 * m_spec["density_g_cm3"]
        material_cost_per_part = (part_weight_grams / 1000.0) * m_spec["cost_per_kg_usd"]

        # Machine time
        print_hours_per_part = max(effective_material_cm3 / p_spec["deposition_rate_cm3_hr"], 0.25)
        machine_cost_per_part = print_hours_per_part * p_spec["machine_hourly_rate_usd"]

        # Setup fee (fixed per batch)
        base_setup_fee = p_spec["setup_fee_base_usd"]
        setup_fee_per_part = base_setup_fee / quantity

        # Post-processing / Finishing
        finish_cost_per_part = 5.0
        finish_desc = "Standard support removal & manual cleanup"
        if finish in ("bead_blasted", "vapor_smoothed"):
            finish_cost_per_part = 14.0
            finish_desc = "Vapor smoothing / abrasive bead blasting"

        # Unit pricing before quantity discount
        gross_unit_cost = (
            setup_fee_per_part + material_cost_per_part + machine_cost_per_part + finish_cost_per_part
        )
        discounted_unit_price = round(max(gross_unit_cost * qty_factor, 12.0), 2)
        total_price = round(discounted_unit_price * quantity, 2)

        line_items = [
            LineItem(
                item_name="Engineering Slicing & Machine Setup",
                description=f"Bed leveling, calibration, and slicing overhead (${base_setup_fee:.2f} batch setup amortized)",
                unit_cost=round(setup_fee_per_part, 2),
                total_cost=round(setup_fee_per_part * quantity, 2),
            ),
            LineItem(
                item_name=f"Raw Material ({m_spec['name']})",
                description=(
                    f"Consumes ~{part_weight_grams:.1f}g material ({effective_material_cm3:.1f} cm³ incl. supports). "
                    + ("(APPROXIMATE: derived from 25% bounding envelope due to open mesh)." if approximate_volume_used else "(Exact manifold solid volume).")
                ),
                unit_cost=round(material_cost_per_part, 2),
                total_cost=round(material_cost_per_part * quantity, 2),
            ),
            LineItem(
                item_name=f"Additive Machine Time ({p_spec['name']})",
                description=f"Estimated {print_hours_per_part:.2f} print hours @ ${p_spec['machine_hourly_rate_usd']:.2f}/hr",
                unit_cost=round(machine_cost_per_part, 2),
                total_cost=round(machine_cost_per_part * quantity, 2),
            ),
            LineItem(
                item_name=f"Surface Finishing ({finish})",
                description=finish_desc,
                unit_cost=round(finish_cost_per_part, 2),
                total_cost=round(finish_cost_per_part * quantity, 2),
            ),
        ]

        if qty_factor < 1.0:
            discount_pct = int((1.0 - qty_factor) * 100)
            line_items.append(
                LineItem(
                    item_name="Volume Batch Discount",
                    description=f"{discount_pct}% volume manufacturing discount for batch size of {quantity}",
                    unit_cost=round(-gross_unit_cost * (1.0 - qty_factor), 2),
                    total_cost=round(-gross_unit_cost * (1.0 - qty_factor) * quantity, 2),
                )
            )

        lead_time = p_spec["base_lead_time_days"] + (1 if quantity > 10 else 0)

        assumptions = {
            "calculation_model": "Additive Infill & Extrusion Physics",
            "effective_volume_cm3": round(effective_material_cm3, 2),
            "estimated_weight_grams": round(part_weight_grams, 2),
            "material_density_g_cm3": m_spec["density_g_cm3"],
            "raw_material_kg_rate_usd": m_spec["cost_per_kg_usd"],
            "print_time_hours_per_unit": round(print_hours_per_part, 2),
            "approximate_volume_used": approximate_volume_used,
            "disclaimer": "Indicative algorithmically derived pricing for prototype budgeting; subject to final CAM slicer path confirmation.",
        }

        return {
            "process": process,
            "material": material,
            "quantity": quantity,
            "finish": finish,
            "unit_price": discounted_unit_price,
            "total_price": total_price,
            "currency": "USD",
            "lead_time_business_days": lead_time,
            "estimate_status": "indicative",
            "line_items": [item.model_dump() for item in line_items],
            "pricing_assumptions": assumptions,
        }

    @classmethod
    def _calculate_subtractive_quote(
        cls,
        analysis_id: str,
        process: str,
        material: str,
        quantity: int,
        finish: str,
        dim_x: float,
        dim_y: float,
        dim_z: float,
        is_volume_valid: bool,
        volume_mm3: Optional[float],
        surface_area_mm2: float,
        qty_factor: float,
    ) -> Dict[str, Any]:
        p_spec = PROCESS_SPECS[process]
        m_spec = MATERIAL_SPECS[material]

        # Subtractive raw stock: rectangular prism billet with cutting margin
        margin = p_spec["stock_margin_mm"]
        stock_x = dim_x + margin
        stock_y = dim_y + margin
        stock_z = dim_z + margin
        billet_volume_cm3 = (stock_x * stock_y * stock_z) / 1000.0

        billet_weight_kg = (billet_volume_cm3 * m_spec["density_g_cm3"]) / 1000.0
        material_cost_per_part = max(billet_weight_kg * m_spec["cost_per_kg_usd"], 8.0)

        # Volume removed
        approximate_volume_used = False
        if is_volume_valid and volume_mm3 and volume_mm3 > 0:
            part_volume_cm3 = volume_mm3 / 1000.0
            chips_removed_cm3 = max(billet_volume_cm3 - part_volume_cm3, 0.1 * billet_volume_cm3)
        else:
            approximate_volume_used = True
            chips_removed_cm3 = billet_volume_cm3 * 0.60

        # Roughing cycle time (accounting for material machinability rating)
        machinability = m_spec["machinability_rating"]
        effective_mrr = p_spec["mrr_cm3_min_aluminum"] / machinability
        roughing_mins = chips_removed_cm3 / effective_mrr

        # Finishing cycle time based on surface area
        surface_cm2 = surface_area_mm2 / 100.0
        finishing_mins = surface_cm2 / p_spec["surface_finishing_cm2_min"]

        total_machining_mins = max(roughing_mins + finishing_mins, 15.0)
        machining_hours = total_machining_mins / 60.0
        machining_cost_per_part = machining_hours * p_spec["machine_hourly_rate_usd"]

        # Programming & Fixturing setup fee (fixed base)
        base_setup_fee = p_spec["setup_fee_base_usd"]
        setup_fee_per_part = base_setup_fee / quantity

        # Finishing
        finish_cost_per_part = 0.0
        finish_desc = "As Machined (Ra 3.2 µm standard toolmarks)"
        if finish == "bead_blasted":
            finish_cost_per_part = 18.0
            finish_desc = "Matte glass bead blast finish"
        elif finish == "anodized":
            finish_cost_per_part = 35.0
            finish_desc = "Type II protective anodizing"

        gross_unit_cost = (
            setup_fee_per_part + material_cost_per_part + machining_cost_per_part + finish_cost_per_part
        )
        discounted_unit_price = round(max(gross_unit_cost * qty_factor, 35.0), 2)
        total_price = round(discounted_unit_price * quantity, 2)

        line_items = [
            LineItem(
                item_name="CAM Programming & Machine Setup",
                description=f"3-Axis toolpath simulation, soft jaws fixturing, work coordinate offsets (${base_setup_fee:.2f} fixed setup)",
                unit_cost=round(setup_fee_per_part, 2),
                total_cost=round(setup_fee_per_part * quantity, 2),
            ),
            LineItem(
                item_name=f"Raw Stock Billet ({m_spec['name']})",
                description=f"Rectangular bar stock {stock_x:.1f}x{stock_y:.1f}x{stock_z:.1f} mm (~{billet_weight_kg:.2f} kg)",
                unit_cost=round(material_cost_per_part, 2),
                total_cost=round(material_cost_per_part * quantity, 2),
            ),
            LineItem(
                item_name="CNC 3-Axis Spindle Runtime",
                description=f"Roughing + contouring ~{total_machining_mins:.1f} mins @ ${p_spec['machine_hourly_rate_usd']:.2f}/hr (MRR factor {machinability:.1f}x)",
                unit_cost=round(machining_cost_per_part, 2),
                total_cost=round(machining_cost_per_part * quantity, 2),
            ),
            LineItem(
                item_name=f"Surface Finishing ({finish})",
                description=finish_desc,
                unit_cost=round(finish_cost_per_part, 2),
                total_cost=round(finish_cost_per_part * quantity, 2),
            ),
        ]

        if qty_factor < 1.0:
            discount_pct = int((1.0 - qty_factor) * 100)
            line_items.append(
                LineItem(
                    item_name="Volume Batch Discount",
                    description=f"{discount_pct}% batch machining amortization discount for quantity {quantity}",
                    unit_cost=round(-gross_unit_cost * (1.0 - qty_factor), 2),
                    total_cost=round(-gross_unit_cost * (1.0 - qty_factor) * quantity, 2),
                )
            )

        lead_time = p_spec["base_lead_time_days"] + (2 if quantity > 10 else 0)

        assumptions = {
            "calculation_model": "Subtractive Billet MRR & Surface Finishing Physics",
            "stock_dimensions_mm": {"x": round(stock_x, 1), "y": round(stock_y, 1), "z": round(stock_z, 1)},
            "billet_volume_cm3": round(billet_volume_cm3, 2),
            "billet_weight_kg": round(billet_weight_kg, 2),
            "material_density_g_cm3": m_spec["density_g_cm3"],
            "machining_time_minutes": round(total_machining_mins, 1),
            "chips_removed_cm3": round(chips_removed_cm3, 2),
            "approximate_volume_used": approximate_volume_used,
            "disclaimer": "Indicative estimation only; final quotation contingent on CAM verification of internal corners and tool reach.",
        }

        return {
            "process": process,
            "material": material,
            "quantity": quantity,
            "finish": finish,
            "unit_price": discounted_unit_price,
            "total_price": total_price,
            "currency": "USD",
            "lead_time_business_days": lead_time,
            "estimate_status": "indicative",
            "line_items": [item.model_dump() for item in line_items],
            "pricing_assumptions": assumptions,
        }
