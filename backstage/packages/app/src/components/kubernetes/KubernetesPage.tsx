import React from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import { Grid, Typography, Card, CardContent, useTheme } from '@material-ui/core';

export const KubernetesPage = () => {
  const theme = useTheme();

  return (
  <Page themeId="tool">
    <Header title="Kubernetes" subtitle="Cluster Overview" />
    <Content>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InfoCard title="Kubernetes Integration">
            <Typography variant="body1" paragraph>
              El plugin de Kubernetes muestra información sobre pods, servicios,
              deployments y otros recursos de tus aplicaciones desplegadas.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Para ver recursos específicos, visita la página de cualquier componente
              en el catálogo que tenga anotaciones de Kubernetes configuradas.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Configuración Requerida</Typography>
              <Typography variant="body2">
                • <strong>Cluster configurado</strong> en app-config.yaml<br/>
                • <strong>Anotaciones</strong> en componentes del catálogo:<br/>
                <code>backstage.io/kubernetes-id: mi-app</code><br/>
                <code>backstage.io/kubernetes-namespace: production</code><br/><br/>
                <em>Los clusters configurados aparecen en la configuración del backend.</em>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recursos Monitoreados</Typography>
              <Typography variant="body2">
                • <strong>Pods</strong> y su estado (Running, Pending, Failed)<br/>
                • <strong>Deployments</strong> y número de réplicas<br/>
                • <strong>Servicios</strong> y endpoints expuestos<br/>
                • <strong>ConfigMaps y Secrets</strong> utilizados<br/>
                • <strong>HPA</strong> (Horizontal Pod Autoscaling)<br/>
                • <strong>Ingress</strong> y reglas de tráfico
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Ejemplo de Configuración de Componente</Typography>
              <Typography variant="body2" paragraph>
                Para que un componente muestre información de Kubernetes, configura estas anotaciones:
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
    backstage.io/kubernetes-id: web-portal
    backstage.io/kubernetes-namespace: production
    # Opcional: especificar etiquetas específicas
    backstage.io/kubernetes-label-selector: 'app=web-portal,version=v1.2.3'`}
              </Typography>
              <Typography variant="body2" style={{marginTop: '8px'}}>
                <em>Nota: Los clusters deben estar configurados en app-config.yaml con las credenciales apropiadas.</em>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Content>
  </Page>
  );
};