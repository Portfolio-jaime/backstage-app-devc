import React from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import { Grid, Typography, Card, CardContent, useTheme } from '@material-ui/core';

export const DatadogPage = () => {
  const theme = useTheme();

  return (
  <Page themeId="tool">
    <Header title="Datadog Monitoring" subtitle="Observabilidad y Monitoreo" />
    <Content>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InfoCard title="Integración con Datadog">
            <Typography variant="body1" paragraph>
              Datadog proporciona monitoreo completo de aplicaciones, infraestructura,
              logs y métricas personalizadas para el ecosistema de British Airways.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Para configurar la integración, instala el plugin @roadiehq/backstage-plugin-datadog
              y configura las credenciales en app-config.yaml.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Métricas Disponibles</Typography>
              <Typography variant="body2">
                • <strong>APM</strong> - Trazas de aplicaciones<br/>
                • <strong>Infrastructure</strong> - CPU, memoria, red<br/>
                • <strong>Logs</strong> - Agregación y búsqueda<br/>
                • <strong>Synthetics</strong> - Tests automáticos<br/>
                • <strong>RUM</strong> - Real User Monitoring<br/>
                • <strong>Custom Metrics</strong> - Métricas de negocio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Dashboards BA</Typography>
              <Typography variant="body2">
                • <strong>Platform Overview</strong> - Estado general<br/>
                • <strong>Application Performance</strong> - Rendimiento apps<br/>
                • <strong>Infrastructure Health</strong> - Estado servidores<br/>
                • <strong>Security Monitoring</strong> - Eventos de seguridad<br/>
                • <strong>Business KPIs</strong> - Indicadores clave<br/>
                • <strong>Incident Response</strong> - Gestión de incidentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Configuración de Entidades</Typography>
              <Typography variant="body2" paragraph>
                Para mostrar métricas de Datadog en componentes, configura estas anotaciones:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                style={{
                  background: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                  color: theme.palette.text.primary,
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'auto'
                }}
              >
{`metadata:
  annotations:
    datadoghq.com/dashboard-url: https://app.datadoghq.eu/dashboard/abc-123
    datadoghq.com/site: datadoghq.eu
    # Opcional: tags específicos para filtros
    datadoghq.com/tags: 'env:production,team:platform,service:web-portal'`}
              </Typography>
              <Typography variant="body2" style={{marginTop: '8px'}}>
                <em>Nota: Requiere configuración de API keys en app-config.yaml y el plugin instalado.</em>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Content>
  </Page>
  );
};