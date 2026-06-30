/**
 * Página principal: Datos logísticos y de empaque (Alta SKU)
 * 4 frames en columna vertical con scroll.
 * Orden: Datos logísticos, Medidas con empaque individual, Empaques del producto, Entrega y manipulación.
 */

import SEOHead from '@/components/common/SEOHead/SEOHead';
import { useTranslation } from '@/hooks/useTranslation';
import { useAtomValue, useSetAtom } from 'jotai';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import TarjetaDatosLogisticos from '../components/TarjetaDatosLogisticos';
import TarjetaMedidasEmpaqueIndividual from '../components/TarjetaMedidasEmpaqueIndividual';
import TarjetaEmpaquesProducto from '../components/TarjetaEmpaquesProducto';
import TarjetaEntregaManipulacion from '../components/TarjetaEntregaManipulacion';
import {
    datosLogisticosEmpaqueStateAtom,
    guardadoStatusAtom,
    guardadoMensajeAtom,
    guardadoSectionAtom,
    collapseSectionAfterSaveAtom,
    erroresDatosLogisticosAtom,
    erroresMedidasAtom,
    erroresEmpaquesAtom,
    erroresEntregaAtom,
    filasCedisLoadingAtom,
    filasCedisErrorAtom,
    setDatosLogisticosAtom,
    savedSectionsAtom,
    supplierIdAtom,
    prospectiveFolioAtom,
} from '../store/datosLogisticosEmpaqueAtoms';
import type { SavedSectionName } from '../store/datosLogisticosEmpaqueAtoms';
import { getFilasCedis } from '../api/datosLogisticosApi';
import {
    findSupplierItems,
    getContainerTypes,
    getItemPackSizes,
    getLeadTimes,
    getReceivingUnitsBySupplierItemId,
    getSupplierItemById,
    type ContainerType,
    type ItemPackSize,
    type LeadTimesData,
    type SupplierItemReceivingUnit,
    type SupplierItemSummary
} from '../api/supplierItemMasterDataApi';
import {
    getLogisticsSectionsDraft,
    saveDatosLogisticos,
    saveMedidasEmpaqueIndividual,
    saveEmpaquesProducto,
    saveEntregaManipulacion,
} from '../api/productDraftsApi';
import {
    setMedidasEmpaqueIndividualAtom,
    setEmpaquesProductoAtom,
    setEntregaManipulacionAtom,
} from '../store/datosLogisticosEmpaqueAtoms';
import {
    validarDatosLogisticos,
    validarMedidasEmpaqueIndividual,
    validarEmpaquesProducto,
    validarEntregaManipulacion,
    tieneErrores
} from '../utils/validaciones';
import './DatosLogisticosEmpaquePage.scss';

const SUPPLIER_ID_PATTERN = /^[A-Za-z0-9]{1,12}$/;
const ITEM_SKU_PATTERN = /^[A-Za-z0-9.\-]{1,10}$/;
const ITEM_SKU_HELPER_PATTERN = /^[A-Za-z0-9-]{5,20}$/;
const AREA_TYPE_CODE_PATTERN = /^(1|2)$/;
const NUMERIC_PATTERN = /^\d+$/;

const DatosLogisticosEmpaquePage: React.FC = () => {
    const { t } = useTranslation();
    const state = useAtomValue(datosLogisticosEmpaqueStateAtom);
    const setDatosLogisticos = useSetAtom(setDatosLogisticosAtom);
    const setMedidasEmpaqueIndividual = useSetAtom(setMedidasEmpaqueIndividualAtom);
    const setEmpaquesProducto = useSetAtom(setEmpaquesProductoAtom);
    const setEntregaManipulacion = useSetAtom(setEntregaManipulacionAtom);
    const setFilasCedisLoading = useSetAtom(filasCedisLoadingAtom);
    const setFilasCedisError = useSetAtom(filasCedisErrorAtom);
    const guardadoStatus = useAtomValue(guardadoStatusAtom);
    const guardadoSection = useAtomValue(guardadoSectionAtom);
    const setGuardadoStatus = useSetAtom(guardadoStatusAtom);
    const setGuardadoMensaje = useSetAtom(guardadoMensajeAtom);
    const setGuardadoSection = useSetAtom(guardadoSectionAtom);
    const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom);
    const setSavedSections = useSetAtom(savedSectionsAtom);
    const savedSections = useAtomValue(savedSectionsAtom);
    const supplierId = useAtomValue(supplierIdAtom);
    const prospectiveFolio = useAtomValue(prospectiveFolioAtom);
    const setSupplierIdAtom = useSetAtom(supplierIdAtom);
    const setProspectiveFolioAtom = useSetAtom(prospectiveFolioAtom);

    const cerrarModalExito = useCallback(() => {
        setGuardadoStatus('idle');
        setGuardadoMensaje(null);
    }, [setGuardadoStatus, setGuardadoMensaje]);
    const setErroresDatos = useSetAtom(erroresDatosLogisticosAtom);
    const setErroresMedidas = useSetAtom(erroresMedidasAtom);
    const setErroresEmpaques = useSetAtom(erroresEmpaquesAtom);
    const setErroresEntrega = useSetAtom(erroresEntregaAtom);
    const skipNextSchemaReloadRef = useRef(false);
    const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
    const [containerTypesLoading, setContainerTypesLoading] = useState(false);
    const [containerTypesError, setContainerTypesError] = useState<string | null>(null);
    const [itemNumber, setItemNumber] = useState('');
    const [itemSku, setItemSku] = useState('');
    const [areaTypeCode, setAreaTypeCode] = useState('2');
    const [supplierItemId, setSupplierItemId] = useState('');
    const [supplierItem, setSupplierItem] = useState<SupplierItemSummary | null>(null);
    const [receivingUnits, setReceivingUnits] = useState<SupplierItemReceivingUnit[]>([]);
    const [supplierItemLoading, setSupplierItemLoading] = useState(false);
    const [supplierItemError, setSupplierItemError] = useState<string | null>(null);
    const [packSizes, setPackSizes] = useState<ItemPackSize[]>([]);
    const [packSizesLoading, setPackSizesLoading] = useState(false);
    const [packSizesError, setPackSizesError] = useState<string | null>(null);
    const [leadTimes, setLeadTimes] = useState<LeadTimesData | null>(null);
    const [leadTimesLoading, setLeadTimesLoading] = useState(false);
    const [leadTimesError, setLeadTimesError] = useState<string | null>(null);
    const [leadTimesInfoMessage, setLeadTimesInfoMessage] = useState<string | null>(null);

    const validarFolioAntesDeGuardar = useCallback((): boolean => {
        if (prospectiveFolio) return true;
        const missingFolioMessage = t('datosLogisticos.messages.missingFolio');
        setGuardadoStatus('error');
        setGuardadoSection(null);
        setGuardadoMensaje(
            missingFolioMessage === 'datosLogisticos.messages.missingFolio'
                ? 'No se encontró el folio de la propuesta. Recarga la página desde el flujo de alta de SKU.'
                : missingFolioMessage
        );
        return false;
    }, [prospectiveFolio, setGuardadoMensaje, setGuardadoSection, setGuardadoStatus, t]);

    // ── Leer folio y supplierId desde URL query params al montar ───────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const folio = params.get('folio') ?? params.get('prospectiveFolio') ?? '';
        const supplier = params.get('supplierId') ?? '';
        const itemNumberParam = params.get('itemNumber') ?? '';
        const itemSkuParam = params.get('itemSKU') ?? '';
        const areaTypeCodeParam = params.get('areaTypeCode') ?? '';
        const supplierItemIdParam = params.get('supplierItemId') ?? '';
        if (folio) setProspectiveFolioAtom(folio);
        if (supplier) setSupplierIdAtom(supplier);
        if (itemNumberParam) setItemNumber(itemNumberParam);
        if (itemSkuParam) setItemSku(itemSkuParam);
        if (areaTypeCodeParam) {
            setAreaTypeCode(AREA_TYPE_CODE_PATTERN.test(areaTypeCodeParam) ? areaTypeCodeParam : '2');
        }
        if (supplierItemIdParam) setSupplierItemId(supplierItemIdParam);
    }, [setProspectiveFolioAtom, setSupplierIdAtom]);

    // ── Carga inicial: leer las 4 tarjetas del borrador (ProductDrafts) ────────
    useEffect(() => {
        if (!prospectiveFolio) return;
        let cancelled = false;
        setFilasCedisLoading(true);
        setFilasCedisError(null);
        getLogisticsSectionsDraft(prospectiveFolio)
            .then((sections) => {
                if (cancelled) return;
                setDatosLogisticos(sections.datosLogisticos);
                setMedidasEmpaqueIndividual(sections.medidasEmpaqueIndividual);
                setEmpaquesProducto(sections.empaquesProducto);
                setEntregaManipulacion(sections.entregaManipulacion);
                // Usar supplier_id del draft como fallback cuando no viene en query params
                if (sections.supplierId && !supplierId) {
                    setSupplierIdAtom(sections.supplierId);
                }
                skipNextSchemaReloadRef.current =
                    Boolean(sections.datosLogisticos.tipoEsquemaDistribucion) &&
                    sections.datosLogisticos.filasCedis.length > 0;
            })
            .catch((err) => {
                if (!cancelled) {
                    setFilasCedisError(err instanceof Error ? err.message : 'Error al cargar el borrador');
                }
            })
            .finally(() => {
                if (!cancelled) setFilasCedisLoading(false);
            });
        return () => { cancelled = true; };
    }, [prospectiveFolio, supplierId, setSupplierIdAtom, setDatosLogisticos, setMedidasEmpaqueIndividual, setEmpaquesProducto, setEntregaManipulacion, setFilasCedisLoading, setFilasCedisError]);

    // ── Recargar CEDIS cuando cambia el esquema seleccionado ───────────────────
    const schemaId = state.datosLogisticos.tipoEsquemaDistribucion;
    useEffect(() => {
        if (!supplierId || !schemaId) return;

        if (skipNextSchemaReloadRef.current && state.datosLogisticos.filasCedis.length > 0) {
            skipNextSchemaReloadRef.current = false;
            return;
        }

        let cancelled = false;
        setFilasCedisLoading(true);
        setFilasCedisError(null);
        getFilasCedis(supplierId, schemaId)
            .then((filas) => {
                if (!cancelled) setDatosLogisticos({ filasCedis: filas });
            })
            .catch((err) => {
                if (!cancelled) setFilasCedisError(err instanceof Error ? err.message : 'Error al cargar CEDIS');
            })
            .finally(() => {
                if (!cancelled) setFilasCedisLoading(false);
            });
        return () => { cancelled = true; };
    }, [supplierId, schemaId, state.datosLogisticos.filasCedis.length, setDatosLogisticos, setFilasCedisLoading, setFilasCedisError]);

    useEffect(() => {
        let cancelled = false;
        setContainerTypesLoading(true);
        setContainerTypesError(null);

        getContainerTypes()
            .then((types) => {
                if (!cancelled) {
                    setContainerTypes(types);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setContainerTypesError(err instanceof Error ? err.message : 'Error al cargar tipos de contenedor');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setContainerTypesLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const skuForLookup = (itemSku || itemNumber).trim();
        const hasValidSupplierId = SUPPLIER_ID_PATTERN.test(supplierId);
        const hasValidSku =
            ITEM_SKU_PATTERN.test(skuForLookup) || ITEM_SKU_HELPER_PATTERN.test(skuForLookup);
        const hasValidAreaTypeCode = AREA_TYPE_CODE_PATTERN.test(areaTypeCode);
        const hasNumericSku = NUMERIC_PATTERN.test(skuForLookup);
        const hasNumericSupplierId = NUMERIC_PATTERN.test(supplierId);
        const canCallPackSizes = hasValidSupplierId && hasValidSku && hasValidAreaTypeCode;
        const canCallLeadTimes = canCallPackSizes && hasNumericSku && hasNumericSupplierId;
        const canSearchSupplierItem = NUMERIC_PATTERN.test(supplierId) && Boolean(itemNumber);

        if (!supplierId || (!skuForLookup && !supplierItemId)) {
            setSupplierItem(null);
            setReceivingUnits([]);
            setSupplierItemError(null);
            setSupplierItemLoading(false);
            setPackSizes([]);
            setPackSizesError(null);
            setPackSizesLoading(false);
            setLeadTimes(null);
            setLeadTimesError(null);
            setLeadTimesLoading(false);
            setLeadTimesInfoMessage(null);
            return;
        }

        let cancelled = false;

        if (supplierItemId || canSearchSupplierItem) {
            setSupplierItemLoading(true);
            setSupplierItemError(null);
        } else {
            setSupplierItem(null);
            setReceivingUnits([]);
            setSupplierItemLoading(false);
            setSupplierItemError(null);
        }

        const loadReference = async () => {
            const currentItem = supplierItemId
                ? await getSupplierItemById(supplierItemId)
                : canSearchSupplierItem
                    ? (await findSupplierItems({ supplierId, itemNumber, limit: 1 }))[0] ?? null
                    : null;

            if (!currentItem) {
                throw new Error('No se encontró el artículo de proveedor con los datos recibidos');
            }

            const units = currentItem.id ? await getReceivingUnitsBySupplierItemId(currentItem.id) : [];
            return { currentItem, units };
        };

        if (supplierItemId || canSearchSupplierItem) {
            loadReference()
                .then(({ currentItem, units }) => {
                    if (cancelled) return;
                    setSupplierItem(currentItem);
                    setReceivingUnits(units);
                })
                .catch((err) => {
                    if (!cancelled) {
                        setSupplierItem(null);
                        setReceivingUnits([]);
                        setSupplierItemError(err instanceof Error ? err.message : 'Error al cargar el artículo de proveedor');
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setSupplierItemLoading(false);
                    }
                });
        }

        if (canCallPackSizes) {
            setPackSizesLoading(true);
            setPackSizesError(null);

            getItemPackSizes(supplierId, skuForLookup, areaTypeCode)
                .then((data) => {
                    if (!cancelled) setPackSizes(data);
                })
                .catch((err) => {
                    if (!cancelled) {
                        setPackSizes([]);
                        setPackSizesError(err instanceof Error ? err.message : 'Error al cargar pack-sizes');
                    }
                })
                .finally(() => {
                    if (!cancelled) setPackSizesLoading(false);
                });

            if (canCallLeadTimes) {
                setLeadTimesLoading(true);
                setLeadTimesError(null);
                setLeadTimesInfoMessage(null);

                getLeadTimes(supplierId, skuForLookup, areaTypeCode)
                    .then((data) => {
                        if (!cancelled) setLeadTimes(data);
                    })
                    .catch((err) => {
                        if (!cancelled) {
                            setLeadTimes(null);
                            setLeadTimesError(err instanceof Error ? err.message : 'Error al cargar lead-times');
                        }
                    })
                    .finally(() => {
                        if (!cancelled) setLeadTimesLoading(false);
                    });
            } else {
                setLeadTimes(null);
                setLeadTimesError(null);
                setLeadTimesLoading(false);
                const reason = !hasNumericSku
                    ? 'itemSKU numérico'
                    : !hasNumericSupplierId
                        ? 'supplierID numérico'
                        : 'parámetros válidos';
                setLeadTimesInfoMessage(`Lead-times se omitió: el backend requiere ${reason} para este endpoint.`);
            }
        } else {
            setPackSizes([]);
            setPackSizesError(null);
            setPackSizesLoading(false);
            setLeadTimes(null);
            setLeadTimesError(null);
            setLeadTimesLoading(false);
            setLeadTimesInfoMessage(null);
        }

        return () => {
            cancelled = true;
        };
    }, [supplierId, itemNumber, itemSku, areaTypeCode, supplierItemId]);
    const guardarDatosLogisticos = useCallback(() => {
        if (!validarFolioAntesDeGuardar()) return;

        const e1 = validarDatosLogisticos(state.datosLogisticos);
        setErroresDatos(e1);
        if (tieneErrores(e1)) {
            setGuardadoMensaje(t('datosLogisticos.messages.fixDatos'));
            setGuardadoStatus('error');
            return;
        }
        setGuardadoSection('datos');
        setGuardadoStatus('loading');
        setGuardadoMensaje(null);
        saveDatosLogisticos(prospectiveFolio, state.datosLogisticos)
            .then(() => {
                setGuardadoStatus('success');
                setGuardadoMensaje(t('datosLogisticos.messages.savedDatos'));
                setCollapseSectionAfterSave('datos');
                setGuardadoSection(null);
                setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'datos']));
            })
            .catch((err) => {
                setGuardadoStatus('error');
                setGuardadoMensaje(err instanceof Error ? err.message : t('datosLogisticos.messages.fixDatos'));
                setGuardadoSection(null);
            });
    }, [
        state.datosLogisticos,
        prospectiveFolio,
        setErroresDatos,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        validarFolioAntesDeGuardar,
        t
    ]);

    const guardarMedidasEmpaqueIndividual = useCallback(() => {
        if (!validarFolioAntesDeGuardar()) return;

        const e2 = validarMedidasEmpaqueIndividual(state.medidasEmpaqueIndividual);
        setErroresMedidas(e2);
        if (tieneErrores(e2)) {
            setGuardadoMensaje(t('datosLogisticos.messages.fixMedidas'));
            setGuardadoStatus('error');
            return;
        }
        setGuardadoSection('medidas');
        setGuardadoStatus('loading');
        setGuardadoMensaje(null);
        saveMedidasEmpaqueIndividual(prospectiveFolio, state.medidasEmpaqueIndividual)
            .then(() => {
                setGuardadoStatus('success');
                setGuardadoMensaje(t('datosLogisticos.messages.savedMedidas'));
                setCollapseSectionAfterSave('medidas');
                setGuardadoSection(null);
                setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'medidas']));
            })
            .catch((err) => {
                setGuardadoStatus('error');
                setGuardadoMensaje(err instanceof Error ? err.message : t('datosLogisticos.messages.fixMedidas'));
                setGuardadoSection(null);
            });
    }, [
        state.medidasEmpaqueIndividual,
        prospectiveFolio,
        setErroresMedidas,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        validarFolioAntesDeGuardar,
        t
    ]);

    const guardarEmpaquesProducto = useCallback(() => {
        if (!validarFolioAntesDeGuardar()) return;

        const e3 = validarEmpaquesProducto(state.empaquesProducto);
        setErroresEmpaques(e3);
        if (tieneErrores(e3)) {
            setGuardadoMensaje(t('datosLogisticos.messages.fixEmpaques'));
            setGuardadoStatus('error');
            return;
        }
        setGuardadoSection('empaques');
        setGuardadoStatus('loading');
        setGuardadoMensaje(null);
        saveEmpaquesProducto(prospectiveFolio, state.empaquesProducto)
            .then(() => {
                setGuardadoStatus('success');
                setGuardadoMensaje(t('datosLogisticos.messages.savedEmpaques'));
                setCollapseSectionAfterSave('empaques');
                setGuardadoSection(null);
                setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'empaques']));
            })
            .catch((err) => {
                setGuardadoStatus('error');
                setGuardadoMensaje(err instanceof Error ? err.message : t('datosLogisticos.messages.fixEmpaques'));
                setGuardadoSection(null);
            });
    }, [
        state.empaquesProducto,
        prospectiveFolio,
        setErroresEmpaques,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        validarFolioAntesDeGuardar,
        t
    ]);

    const guardarEntregaManipulacion = useCallback(() => {
        if (!validarFolioAntesDeGuardar()) return;

        const e4 = validarEntregaManipulacion(state.entregaManipulacion);
        setErroresEntrega(e4);
        if (tieneErrores(e4)) {
            setGuardadoMensaje(t('datosLogisticos.messages.fixEntrega'));
            setGuardadoStatus('error');
            return;
        }
        setGuardadoSection('entrega');
        setGuardadoStatus('loading');
        setGuardadoMensaje(null);
        saveEntregaManipulacion(prospectiveFolio, state.entregaManipulacion)
            .then(() => {
                setGuardadoStatus('success');
                setGuardadoMensaje(t('datosLogisticos.messages.savedEntrega'));
                setCollapseSectionAfterSave('entrega');
                setGuardadoSection(null);
                setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'entrega']));
            })
            .catch((err) => {
                setGuardadoStatus('error');
                setGuardadoMensaje(err instanceof Error ? err.message : t('datosLogisticos.messages.fixEntrega'));
                setGuardadoSection(null);
            });
    }, [
        state.entregaManipulacion,
        prospectiveFolio,
        setErroresEntrega,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        validarFolioAntesDeGuardar,
        t
    ]);

    return (
        <>
            <SEOHead
                title={t('datosLogisticos.pageTitle')}
                description="Flujo de captura de datos logísticos y de empaque para alta de SKU. Vista proveedor."
                keywords="Alta SKU, datos logísticos, empaque, medidas, entrega, manipulación"
            />
            <div className="datos-logisticos-empaque-page datos-logisticos-empaque-layout">
                {/* Área de contenido con scroll - 4 frames en columna vertical */}
                {/* Modal de éxito al guardar (reemplaza la alerta) */}
                <Dialog
                    visible={guardadoStatus === 'success'}
                    onHide={cerrarModalExito}
                    closable={false}
                    dismissableMask
                    modal
                    showHeader={false}
                    className="modal-exito-guardado"
                    contentClassName="modal-exito-guardado-content"
                    blockScroll
                >
                    <div className="modal-exito-body">
                        <button
                            type="button"
                            className="modal-exito-close"
                            onClick={cerrarModalExito}
                            aria-label={t('common.close')}
                        >
                            <i className="pi pi-times" />
                        </button>
                        <div className="modal-exito-icon" aria-hidden="true">
                            <i className="pi pi-check" />
                        </div>
                        <h2 className="modal-exito-title">{t('datosLogisticos.modalSuccess.title')}</h2>
                        <p className="modal-exito-message">{t('datosLogisticos.modalSuccess.message')}</p>
                        <Button
                            label={t('common.accept')}
                            onClick={cerrarModalExito}
                            className="modal-exito-btn p-button-primary"
                        />
                    </div>
                </Dialog>

                <div className="content-scroll">
                    <div className="content-scroll-inner">
                        <div className="secciones-grid">
                            {/* 1. Datos logísticos - segmento según imagen; botón Guardar en footer del segmento */}
                            <div className="seccion-card">
                                <Card className="card-seccion card-seccion-datos-logisticos cv-main-accordion">
                                    <TarjetaDatosLogisticos saved={savedSections.has('datos')}>
                                        <Button
                                            label={t('common.save')}
                                            icon="sclt clt-save"
                                            iconPos="right"
                                            onClick={guardarDatosLogisticos}
                                            loading={guardadoSection === 'datos' && guardadoStatus === 'loading'}
                                            disabled={guardadoStatus === 'loading'}
                                            className="p-button-sm p-button-primary"
                                        />
                                    </TarjetaDatosLogisticos>
                                </Card>
                            </div>

                            {/* 2. Medidas con empaque individual (HU 041, 042, 043); botón Guardar en footer */}
                            <div className="seccion-card">
                                <Card className="card-seccion card-seccion-medidas-empaque cv-main-accordion">
                                    <TarjetaMedidasEmpaqueIndividual saved={savedSections.has('medidas')}>
                                        <Button
                                            label={t('common.save')}
                                            icon="sclt clt-save"
                                            iconPos="right"
                                            onClick={guardarMedidasEmpaqueIndividual}
                                            loading={guardadoSection === 'medidas' && guardadoStatus === 'loading'}
                                            disabled={guardadoStatus === 'loading'}
                                            className="p-button-sm p-button-outlined p-button-primary"
                                        />
                                    </TarjetaMedidasEmpaqueIndividual>
                                </Card>
                            </div>

                            {/* 3. Empaques del producto - Cartón máster (HU 044, 045, 046); botón Guardar en footer */}
                            <div className="seccion-card">
                                <Card className="card-seccion card-seccion-empaques-producto cv-main-accordion">
                                    <TarjetaEmpaquesProducto
                                        saved={savedSections.has('empaques')}
                                        containerTypes={containerTypes}
                                        containerTypesLoading={containerTypesLoading}
                                        containerTypesError={containerTypesError}
                                        supplierItem={supplierItem}
                                        supplierItemLoading={supplierItemLoading}
                                        supplierItemError={supplierItemError}
                                        receivingUnits={receivingUnits}
                                        packSizes={packSizes}
                                        packSizesLoading={packSizesLoading}
                                        packSizesError={packSizesError}
                                        leadTimes={leadTimes}
                                        leadTimesLoading={leadTimesLoading}
                                        leadTimesError={leadTimesError}
                                        leadTimesInfoMessage={leadTimesInfoMessage}
                                    >
                                        <Button
                                            label={t('common.save')}
                                            icon="sclt clt-save"
                                            iconPos="right"
                                            onClick={guardarEmpaquesProducto}
                                            loading={guardadoSection === 'empaques' && guardadoStatus === 'loading'}
                                            disabled={guardadoStatus === 'loading'}
                                            className="p-button-sm p-button-primary"
                                        />
                                    </TarjetaEmpaquesProducto>
                                </Card>
                            </div>

                            {/* 4. Entrega y manipulación (HU 047, 048, 049); botón Guardar en footer */}
                            <div className="seccion-card">
                                <Card className="card-seccion card-seccion-entrega-manipulacion cv-main-accordion">
                                    <TarjetaEntregaManipulacion saved={savedSections.has('entrega')}>
                                        <Button
                                            label={t('common.save')}
                                            icon="sclt clt-save"
                                            iconPos="right"
                                            onClick={guardarEntregaManipulacion}
                                            loading={guardadoSection === 'entrega' && guardadoStatus === 'loading'}
                                            disabled={guardadoStatus === 'loading'}
                                            className="p-button-sm p-button-primary"
                                        />
                                    </TarjetaEntregaManipulacion>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DatosLogisticosEmpaquePage;
