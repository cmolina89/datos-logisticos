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
import { useCallback, useEffect } from 'react';
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
    savedSectionsAtom
} from '../store/datosLogisticosEmpaqueAtoms';
import type { SavedSectionName } from '../store/datosLogisticosEmpaqueAtoms';
import { getFilasCedis } from '../api/datosLogisticosApi';
import {
    validarDatosLogisticos,
    validarMedidasEmpaqueIndividual,
    validarEmpaquesProducto,
    validarEntregaManipulacion,
    tieneErrores
} from '../utils/validaciones';
import './DatosLogisticosEmpaquePage.scss';

const DatosLogisticosEmpaquePage: React.FC = () => {
    const { t } = useTranslation();
    const state = useAtomValue(datosLogisticosEmpaqueStateAtom);
    const setDatosLogisticos = useSetAtom(setDatosLogisticosAtom);
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

    const cerrarModalExito = useCallback(() => {
        setGuardadoStatus('idle');
        setGuardadoMensaje(null);
    }, [setGuardadoStatus, setGuardadoMensaje]);
    const setErroresDatos = useSetAtom(erroresDatosLogisticosAtom);
    const setErroresMedidas = useSetAtom(erroresMedidasAtom);
    const setErroresEmpaques = useSetAtom(erroresEmpaquesAtom);
    const setErroresEntrega = useSetAtom(erroresEntregaAtom);

    useEffect(() => {
        let cancelled = false;
        setFilasCedisLoading(true);
        setFilasCedisError(null);
        getFilasCedis()
            .then((filas) => {
                if (!cancelled) {
                    setDatosLogisticos({ filasCedis: filas });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setFilasCedisError(err instanceof Error ? err.message : 'Error al cargar datos');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setFilasCedisLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [setDatosLogisticos, setFilasCedisLoading, setFilasCedisError]);

    const guardarDatosLogisticos = useCallback(() => {
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
        setTimeout(() => {
            setGuardadoStatus('success');
            setGuardadoMensaje(t('datosLogisticos.messages.savedDatos'));
            setCollapseSectionAfterSave('datos');
            setGuardadoSection(null);
            setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'datos']));
        }, 1000);
    }, [
        state.datosLogisticos,
        setErroresDatos,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        t
    ]);

    const guardarMedidasEmpaqueIndividual = useCallback(() => {
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
        setTimeout(() => {
            setGuardadoStatus('success');
            setGuardadoMensaje(t('datosLogisticos.messages.savedMedidas'));
            setCollapseSectionAfterSave('medidas');
            setGuardadoSection(null);
            setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'medidas']));
        }, 1000);
    }, [
        state.medidasEmpaqueIndividual,
        setErroresMedidas,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        t
    ]);

    const guardarEmpaquesProducto = useCallback(() => {
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
        setTimeout(() => {
            setGuardadoStatus('success');
            setGuardadoMensaje(t('datosLogisticos.messages.savedEmpaques'));
            setCollapseSectionAfterSave('empaques');
            setGuardadoSection(null);
            setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'empaques']));
        }, 1000);
    }, [
        state.empaquesProducto,
        setErroresEmpaques,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
        t
    ]);

    const guardarEntregaManipulacion = useCallback(() => {
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
        setTimeout(() => {
            setGuardadoStatus('success');
            setGuardadoMensaje(t('datosLogisticos.messages.savedEntrega'));
            setCollapseSectionAfterSave('entrega');
            setGuardadoSection(null);
            setSavedSections((prev: Set<SavedSectionName>) => new Set([...prev, 'entrega']));
        }, 1000);
    }, [
        state.entregaManipulacion,
        setErroresEntrega,
        setGuardadoStatus,
        setGuardadoMensaje,
        setGuardadoSection,
        setCollapseSectionAfterSave,
        setSavedSections,
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
                                    <TarjetaEmpaquesProducto saved={savedSections.has('empaques')}>
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
